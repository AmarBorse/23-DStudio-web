// "Fill from a PDF": reads a project's design PDF in the browser.
// Every page becomes an image; the largest text on the first page is suggested as the name,
// and the longest sentence-like text as the description.

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs"); // legacy build: works in older browsers too
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
  return pdfjs;
}

const TARGET_WIDTH = 2000; // px, page images are rendered at about this width
const MAX_PAGES = 30;

function linesFrom(items) {
  // group text pieces into lines by their vertical position
  const rows = [];
  for (const it of items) {
    if (!it.str?.trim()) continue;
    const y = Math.round(it.transform[5]);
    const size = Math.hypot(it.transform[2], it.transform[3]);
    let row = rows.find((r) => Math.abs(r.y - y) <= Math.max(2, size * 0.3));
    if (!row) rows.push((row = { y, size, parts: [] }));
    row.size = Math.max(row.size, size);
    row.parts.push({ x: it.transform[4], s: it.str });
  }
  return rows
    .sort((a, b) => b.y - a.y)
    .map((r) => ({ size: r.size, text: r.parts.sort((a, b) => a.x - b.x).map((p) => p.s).join(" ").replace(/\s+/g, " ").trim() }))
    .filter((r) => r.text);
}

export async function readPdf(file, onProgress) {
  const pdfjs = await loadPdfJs();
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const count = Math.min(pdf.numPages, MAX_PAGES);
  const pages = [];
  let name = "";
  let description = "";

  for (let n = 1; n <= count; n++) {
    onProgress?.(n, count);
    const page = await pdf.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: Math.min(4, TARGET_WIDTH / base.width) });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    await page.render({ canvas, canvasContext: canvas.getContext("2d"), viewport }).promise;
    const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.88));
    pages.push({
      file: new File([blob], `page-${n}.jpg`, { type: "image/jpeg" }),
      preview: URL.createObjectURL(blob),
      w: canvas.width,
      h: canvas.height,
    });

    if (n <= 2) {
      const lines = linesFrom((await page.getTextContent()).items);
      if (!name && lines.length) {
        const biggest = [...lines].filter((l) => l.text.length >= 2 && l.text.length <= 80).sort((a, b) => b.size - a.size)[0];
        name = biggest?.text || "";
      }
      if (!description) {
        const sentence = lines.filter((l) => l.text.length >= 50 && /[a-z]/.test(l.text)).sort((a, b) => b.text.length - a.text.length)[0];
        description = sentence?.text || "";
      }
    }
  }
  return { name, description, pages, totalPages: pdf.numPages };
}
