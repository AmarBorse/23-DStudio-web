// "Fill from a PDF": reads a project's design PDF in the browser.
//
// Images: each page is drawn, then the separate pictures on it are found (areas divided by blank space)
// and cut out one by one, exactly as they appear in the design. Small things (logo, menu, text) are skipped.
// If a page is one full picture (a slide), the whole page becomes one image.
// Text: the largest heading becomes the name; the longest paragraph becomes the description.

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs"); // legacy build: works in older browsers too
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
  return pdfjs;
}

const TARGET_WIDTH = 2000; // px width the pages are drawn at
const MAX_CANVAS_PIXELS = 60e6; // stay well inside browser canvas limits
const MAX_PAGES = 30;
const NAV_WORDS = new Set(["work", "services", "about", "contact", "home", "start the project", "start the project➔", "➔"]);

/* ---------- text ---------- */
function textLines(items, viewport) {
  const rows = [];
  for (const it of items) {
    const str = it.str?.replace(/\s+/g, " ");
    if (!str?.trim()) continue;
    const [x, y] = viewport.convertToViewportPoint(it.transform[4], it.transform[5]);
    const size = Math.hypot(it.transform[2], it.transform[3]) * viewport.scale;
    let row = rows.find((r) => Math.abs(r.y - y) <= Math.max(2, size * 0.35));
    if (!row) rows.push((row = { y, size, parts: [] }));
    row.size = Math.max(row.size, size);
    row.parts.push({ x, s: str, w: (it.width || 0) * viewport.scale });
  }
  return rows
    .sort((a, b) => a.y - b.y)
    .map((r) => {
      const parts = r.parts.sort((a, b) => a.x - b.x);
      return {
        y: r.y,
        size: r.size,
        x0: parts[0].x,
        x1: Math.max(...parts.map((p) => p.x + p.w)),
        text: parts.map((p) => p.s).join("").replace(/\s+/g, " ").trim(),
      };
    })
    .filter((l) => l.text && !NAV_WORDS.has(l.text.toLowerCase()));
}

function paragraphs(lines) {
  const out = [];
  for (const l of lines) {
    const prev = out[out.length - 1];
    if (prev && Math.abs(prev.size - l.size) <= prev.size * 0.12 && l.y - prev.lastY <= l.size * 2) {
      prev.text += " " + l.text;
      prev.lastY = l.y;
    } else {
      out.push({ text: l.text, size: l.size, y: l.y - l.size, lastY: l.y });
    }
  }
  return out;
}

/* ---------- finding the pictures on a page ---------- */
function findRegions(canvas, textBoxes) {
  const W = 500;
  const s = W / canvas.width;
  const H = Math.max(1, Math.round(canvas.height * s));
  const small = document.createElement("canvas");
  small.width = W;
  small.height = H;
  const ctx = small.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(canvas, 0, 0, W, H);
  const px = ctx.getImageData(0, 0, W, H).data;

  // background colour = the most common colour along the page edges
  const counts = new Map();
  const sample = (x, y) => {
    const i = (y * W + x) * 4;
    const key = `${px[i] >> 4},${px[i + 1] >> 4},${px[i + 2] >> 4}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  };
  for (let x = 0; x < W; x += 2) { sample(x, 0); sample(x, H - 1); }
  for (let y = 0; y < H; y += 2) { sample(0, y); sample(W - 1, y); }
  const bg = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0].split(",").map((v) => Number(v) * 16 + 8);

  const mask = new Uint8Array(W * H);
  for (let i = 0, p = 0; p < W * H; p++, i += 4) {
    mask[p] = Math.abs(px[i] - bg[0]) + Math.abs(px[i + 1] - bg[1]) + Math.abs(px[i + 2] - bg[2]) > 40 ? 1 : 0;
  }
  // blank out text so headings and paragraphs are not mistaken for pictures
  for (const b of textBoxes) {
    const x0 = Math.max(0, Math.floor(b.x0 * s) - 1), x1 = Math.min(W - 1, Math.ceil(b.x1 * s) + 1);
    const y0 = Math.max(0, Math.floor(b.y0 * s) - 1), y1 = Math.min(H - 1, Math.ceil(b.y1 * s) + 1);
    for (let y = y0; y <= y1; y++) mask.fill(0, y * W + x0, y * W + x1 + 1);
  }

  const runs = (len, filled) => {
    const out = [];
    let start = -1;
    for (let i = 0; i <= len; i++) {
      const on = i < len && filled(i);
      if (on && start < 0) start = i;
      if (!on && start >= 0) { out.push([start, i - 1]); start = -1; }
    }
    // join runs separated by tiny gaps (1px) — real gaps between pictures are wider
    return out.reduce((acc, r) => {
      const last = acc[acc.length - 1];
      if (last && r[0] - last[1] <= 2) last[1] = r[1];
      else acc.push(r);
      return acc;
    }, []);
  };
  const rowFilled = (y, x0, x1) => { let n = 0; for (let x = x0; x <= x1; x++) n += mask[y * W + x]; return n > Math.max(1, (x1 - x0 + 1) * 0.01); };
  const colFilled = (x, y0, y1) => { let n = 0; for (let y = y0; y <= y1; y++) n += mask[y * W + x]; return n > Math.max(1, (y1 - y0 + 1) * 0.01); };

  const found = [];
  const cut = (x0, y0, x1, y1, depth) => {
    const bands = runs(y1 - y0 + 1, (i) => rowFilled(y0 + i, x0, x1)).map(([a, b]) => [y0 + a, y0 + b]);
    for (const [by0, by1] of bands) {
      const cols = runs(x1 - x0 + 1, (i) => colFilled(x0 + i, by0, by1)).map(([a, b]) => [x0 + a, x0 + b]);
      for (const [cx0, cx1] of cols) {
        const same = cx0 === x0 && cx1 === x1 && by0 === y0 && by1 === y1;
        if (!same && depth < 4) cut(cx0, by0, cx1, by1, depth + 1);
        else found.push({ x0: cx0, y0: by0, x1: cx1, y1: by1 });
      }
    }
  };
  cut(0, 0, W - 1, H - 1, 0);

  return found
    .filter((r) => r.x1 - r.x0 + 1 >= W * 0.2 && r.y1 - r.y0 + 1 >= W * 0.08)
    .map((r) => ({ x: r.x0 / s, y: r.y0 / s, w: (r.x1 - r.x0 + 1) / s, h: (r.y1 - r.y0 + 1) / s }))
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

async function cropToFile(canvas, r, name) {
  const c = document.createElement("canvas");
  c.width = Math.round(r.w);
  c.height = Math.round(r.h);
  c.getContext("2d").drawImage(canvas, Math.round(r.x), Math.round(r.y), c.width, c.height, 0, 0, c.width, c.height);
  const blob = await new Promise((res) => c.toBlob(res, "image/jpeg", 0.9));
  return { file: new File([blob], name, { type: "image/jpeg" }), preview: URL.createObjectURL(blob), w: c.width, h: c.height };
}

/* ---------- main ---------- */
export async function readPdf(file, onProgress) {
  const pdfjs = await loadPdfJs();
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const count = Math.min(pdf.numPages, MAX_PAGES);
  const images = [];
  let best = null; // biggest heading
  let bestPara = null; // longest paragraph

  for (let n = 1; n <= count; n++) {
    onProgress?.(n, count);
    const page = await pdf.getPage(n);
    const base = page.getViewport({ scale: 1 });
    let scale = Math.min(4, TARGET_WIDTH / base.width);
    if (base.width * base.height * scale * scale > MAX_CANVAS_PIXELS) scale = Math.sqrt(MAX_CANVAS_PIXELS / (base.width * base.height));
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    await page.render({ canvas, canvasContext: canvas.getContext("2d"), viewport }).promise;

    const lines = textLines((await page.getTextContent()).items, viewport);
    const boxes = lines.map((l) => ({ x0: l.x0, x1: l.x1, y0: l.y - l.size, y1: l.y + l.size * 0.3 }));

    let regions = findRegions(canvas, boxes);
    if (!regions.length) regions = [{ x: 0, y: 0, w: canvas.width, h: canvas.height }];
    const pageStart = images.length;
    const toGrid = 1024 / canvas.width; // spacing is stored in design pixels of a 1024px-wide page
    let prevBottom = null;
    for (let i = 0; i < regions.length; i++) {
      const r = regions[i];
      const img = await cropToFile(canvas, r, `page-${n}-image-${i + 1}.jpg`);
      img.half = r.w < canvas.width * 0.6; // sits next to another picture in the design
      img.page = n;
      img.top = r.y;
      // space above this picture, if nothing (like text) sits in between
      const sameRow = i > 0 && Math.abs(r.y - regions[i - 1].y) < 4;
      if (prevBottom !== null && !sameRow) {
        const textBetween = boxes.some((b) => b.y0 >= prevBottom - 2 && b.y1 <= r.y + 2);
        const gap = (r.y - prevBottom) * toGrid;
        if (!textBetween && gap >= 0 && gap <= 200) img.gap = Math.round(gap * 10) / 10;
      }
      if (!sameRow || prevBottom === null) prevBottom = r.y + r.h;
      else prevBottom = Math.max(prevBottom, r.y + r.h);
      images.push(img);
    }

    if (n <= 3) {
      for (const l of lines) {
        if (l.text.length >= 2 && l.text.length <= 80 && (!best || l.size > best.size * 1.05)) best = l;
      }
      for (const p of paragraphs(lines)) {
        if (p.text.length >= 40 && (!bestPara || p.text.length > bestPara.text.length)) {
          // remember which picture the paragraph comes after
          const before = images.slice(pageStart).filter((im) => im.top < p.y);
          bestPara = { ...p, afterIndex: before.length ? images.indexOf(before[before.length - 1]) : pageStart - 1 };
        }
      }
    }
  }

  return {
    name: best?.text || "",
    description: bestPara?.text || "",
    descriptionAfter: bestPara ? bestPara.afterIndex : 0,
    pages: images,
    totalPages: pdf.numPages,
  };
}
