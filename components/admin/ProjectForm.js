"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { saveProject } from "@/app/admin/actions";
import { CATEGORIES } from "@/lib/categories";
import { uploadImage } from "@/components/admin/upload";
import { hasPage as projectHasPage } from "@/lib/projectRules";

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

/* ---------- one image with Replace / Remove ---------- */
function ImageField({ value, onChange, tall = false, label }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const pick = async (f) => {
    if (!f) return;
    setErr("");
    setBusy(true);
    try {
      const img = await uploadImage(f);
      onChange({ ...img, alt: value?.alt || "" });
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={`pf-image${tall ? " tall" : ""}`}>
      {value?.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value.src} alt="" className="pf-image-preview" />
      ) : (
        <button type="button" className="pf-image-empty" onClick={() => input.current?.click()} aria-label={`Add ${label}`}>
          {busy ? "Uploading…" : "+ Add image"}
        </button>
      )}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { pick(e.target.files[0]); e.target.value = ""; }} />
      {value?.src && (
        <div className="pf-image-tools">
          <button type="button" className="adm-btn ghost" onClick={() => input.current?.click()} disabled={busy}>{busy ? "Uploading…" : "Replace"}</button>
          <button type="button" className="adm-btn ghost" onClick={() => onChange(null)}>Remove</button>
        </div>
      )}
      {err && <p className="adm-error" role="alert">{err}</p>}
    </div>
  );
}

/* ---------- gallery: numbered thumbnails with ↑ ↓ ✕ ---------- */
function GalleryField({ items, setItems }) {
  const input = useRef(null);
  const [uploading, setUploading] = useState(0);
  const [err, setErr] = useState("");
  const add = async (files) => {
    setErr("");
    const list = [...files];
    setUploading((n) => n + list.length);
    for (const f of list) {
      try {
        const img = await uploadImage(f);
        setItems((prev) => [...prev, { ...img, alt: "" }]);
      } catch (e) {
        setErr(e.message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };
  const move = (i, d) =>
    setItems((prev) => {
      const j = i + d;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  return (
    <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}>
      <ul className="pf-gallery">
        {items.map((img, i) => (
          <li key={img.src + i} className="pf-thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt="" />
            <div className="pf-thumb-bar">
              <span>{i + 1}</span>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move image ${i + 1} up`}>↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move image ${i + 1} down`}>↓</button>
              <button type="button" className="x" onClick={() => setItems((p) => p.filter((_, j) => j !== i))} aria-label={`Remove image ${i + 1}`}>✕</button>
            </div>
          </li>
        ))}
        {Array.from({ length: uploading }, (_, i) => <li key={`u${i}`} className="pf-thumb loading">Uploading…</li>)}
      </ul>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      <button type="button" className="adm-btn ghost" onClick={() => input.current?.click()}>Add images</button>
      {err && <p className="adm-error" role="alert">{err}</p>}
    </div>
  );
}

/* ---------- Fill from a PDF ---------- */
function PdfFill({ onUse }) {
  const input = useRef(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const [picked, setPicked] = useState([]);
  const [err, setErr] = useState("");
  const [applying, setApplying] = useState(false);

  const read = async (file) => {
    if (!file) return;
    setErr("");
    setResult(null);
    setStatus("Opening PDF…");
    try {
      const { readPdf } = await import("@/components/admin/pdfFill");
      const r = await readPdf(file, (n, total) => setStatus(`Reading page ${n} of ${total}…`));
      setResult(r);
      setPicked(r.pages.map(() => true));
      setStatus("");
    } catch (e) {
      console.error(e);
      setErr("Could not read this PDF. Please try another file.");
      setStatus("");
    }
  };

  const use = async () => {
    setApplying(true);
    try {
      await onUse({ name: result.name, description: result.description, pages: result.pages.filter((_, i) => picked[i]) });
      setResult(null);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="adm-card pf-pdf">
      <div className="pf-pdf-head">
        <div>
          <h2 className="pf-card-title">Fill from a PDF <span className="pf-tag">optional</span></h2>
          <p className="adm-muted">Upload the project’s design PDF. The name, description and every page as an image are picked up automatically, and you can check them before using them.</p>
        </div>
        <button type="button" className="adm-btn ghost" onClick={() => input.current?.click()} disabled={Boolean(status) || applying}>Choose PDF</button>
        <input ref={input} type="file" accept="application/pdf" hidden onChange={(e) => { read(e.target.files[0]); e.target.value = ""; }} />
      </div>
      {status && <p className="pf-status" role="status">{status}</p>}
      {err && <p className="adm-error" role="alert">{err}</p>}
      {result && (
        <div className="pf-pdf-result">
          <dl>
            <dt>Name</dt><dd>{result.name || <span className="adm-muted">not found</span>}</dd>
            <dt>Description</dt><dd>{result.description || <span className="adm-muted">not found</span>}</dd>
          </dl>
          <p className="adm-muted">
            Pages ({picked.filter(Boolean).length} of {result.pages.length} selected{result.totalPages > result.pages.length ? `, first ${result.pages.length} of ${result.totalPages}` : ""}).
            The first selected page becomes the main image and card image; the rest go to the gallery.
          </p>
          <ul className="pf-gallery">
            {result.pages.map((p, i) => (
              <li key={p.preview} className={`pf-thumb pick${picked[i] ? " on" : ""}`}>
                <label>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.preview} alt="" />
                  <span className="pf-thumb-bar">
                    <input type="checkbox" checked={picked[i]} onChange={() => setPicked((x) => x.map((v, j) => (j === i ? !v : v)))} />
                    Page {i + 1}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <div className="adm-inline">
            <button type="button" className="adm-btn" onClick={use} disabled={applying || !picked.some(Boolean)}>{applying ? "Uploading pages…" : "Use these"}</button>
            <button type="button" className="adm-btn ghost" onClick={() => setResult(null)} disabled={applying}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- the form ---------- */
export default function ProjectForm({ project }) {
  const [state, action, pending] = useActionState(saveProject, null);
  const [title, setTitle] = useState(project?.title || "");
  const [caption, setCaption] = useState(project?.caption || "");
  const [description, setDescription] = useState(project?.description || "");
  const [slug, setSlug] = useState(project?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(project));
  const [cardImage, setCardImage] = useState(project?.card_image?.src ? project.card_image : null);
  const [mainImage, setMainImage] = useState(project?.images?.[0] || null);
  const [gallery, setGallery] = useState(project?.images?.slice(1) || []);
  const [hasPage, setHasPage] = useState(project ? projectHasPage(project) : true);

  const setName = (v) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const fillFromPdf = async ({ name, description: desc, pages }) => {
    if (name && (!title || confirm(`Replace the project name with “${name}”?`))) setName(name);
    if (desc && (!description || confirm("Replace the description with the one from the PDF?"))) setDescription(desc);
    const uploaded = [];
    for (const p of pages) uploaded.push({ ...(await uploadImage(p.file)), alt: "" });
    if (!uploaded.length) return;
    const [first, ...rest] = uploaded;
    if (!mainImage) setMainImage(first);
    else rest.unshift(first);
    if (!cardImage) setCardImage(first);
    setGallery((g) => [...g, ...rest]);
    setHasPage(true);
  };

  const images = mainImage ? [mainImage, ...gallery] : gallery;

  return (
    <form action={action} className="pf">
      <div className="pf-top">
        <Link href="/admin/projects" className="pf-back">← All projects</Link>
        <h1 className="pf-title">{project ? `Edit: ${project.title}` : "Add project"}</h1>
      </div>

      {project && <input type="hidden" name="id" value={project.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="card_image" value={JSON.stringify(cardImage)} />

      <PdfFill onUse={fillFromPdf} />

      {/* Basic details */}
      <section className="adm-card pf-card">
        <h2 className="pf-card-title">Basic details</h2>
        <Field label="Project name *" hint="Big title on the project page, e.g. “Shrinathji old age home by TCL”.">
          <input name="title" value={title} required onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="pf-two">
          <Field label="Card caption" hint="Text under the image on the Our Work page. If empty, the project name is used.">
            <input name="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder={title} />
          </Field>
          <Field label="Service (Our Work tab) *" hint="Which tab it appears under.">
            <select name="category" defaultValue={project?.category || ""} required>
              <option value="" disabled>Choose…</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
        </div>
        <Field
          label="Project link (optional)"
          hint="YouTube, VR tour, Google Drive… Without a project page, clicking the card opens this link. With a project page, its photos open this link."
        >
          <input name="link" type="url" placeholder="https://" defaultValue={project?.link || ""} />
        </Field>
      </section>

      {/* Card image */}
      <section className="adm-card pf-card">
        <h2 className="pf-card-title">Card image</h2>
        <Field label="Our Work page image *" hint="The picture on the Our Work page card. If empty, the project page main image is used.">
          <ImageField value={cardImage} onChange={setCardImage} label="card image" />
        </Field>
        <label className="pf-check">
          <input type="checkbox" name="published" defaultChecked={project ? project.published : true} />
          Show on the Our Work page
        </label>
      </section>

      {/* Project page */}
      <section className="adm-card pf-card">
        <label className="pf-check pf-check-big">
          <input type="checkbox" name="has_page" checked={hasPage} onChange={(e) => setHasPage(e.target.checked)} />
          Create a project page
        </label>
        <p className="adm-muted pf-indent">Clicking the project opens its own page: title, main image, description, then the gallery. Untick it to open the project link directly instead.</p>

        {hasPage && (
          <>
            <Field label="Main image *" hint="Big image at the top of the project page.">
              <ImageField value={mainImage} onChange={setMainImage} label="main image" />
            </Field>
            <Field label="Description" hint="Paragraph under the main image. Leave an empty line between paragraphs.">
              <textarea name="description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <Field label="Gallery images" hint="Shown one below another on the project page. You can select several images at once.">
              <GalleryField items={gallery} setItems={setGallery} />
            </Field>
            <Field label="Page address" hint={<>23dstudio…/work/<strong>{slug || "project-name"}</strong></>}>
              <input name="slug" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} />
            </Field>
          </>
        )}
        {!hasPage && <input type="hidden" name="description" value={description} />}
        {!hasPage && <input type="hidden" name="slug" value={slug} />}
        <Field label="Order" hint="Lower numbers come first within the tab.">
          <input name="sort" type="number" defaultValue={project?.sort ?? 0} className="pf-small" />
        </Field>
      </section>

      {state?.error && <p className="adm-error" role="alert">{state.error}</p>}
      <div className="pf-actions">
        <Link className="adm-btn ghost" href="/admin/projects">Cancel</Link>
        {project?.published && (
          <a className="adm-btn ghost" href={projectHasPage(project) ? `/work/${project.slug}` : project.link} target="_blank" rel="noopener noreferrer">View page ↗</a>
        )}
        <button className="adm-btn pf-save" type="submit" disabled={pending}>{pending ? "Saving…" : "Save project"}</button>
      </div>
    </form>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="pf-field">
      <span className="pf-label">{label}</span>
      {hint && <span className="pf-hint">{hint}</span>}
      {children}
    </div>
  );
}
