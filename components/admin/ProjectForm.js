"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { saveProject } from "@/app/admin/actions";
import { CATEGORIES } from "@/lib/categories";
import { uploadImage } from "@/components/admin/upload";

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export default function ProjectForm({ project }) {
  const [state, action, pending] = useActionState(saveProject, null);
  const [title, setTitle] = useState(project?.title || "");
  const [slug, setSlug] = useState(project?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(project));
  const [images, setImages] = useState(project?.images || []);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const fileInput = useRef(null);

  const addFiles = async (files) => {
    setUploadError("");
    const list = [...files];
    setUploading((n) => n + list.length);
    for (const f of list) {
      try {
        const img = await uploadImage(f);
        setImages((prev) => [...prev, { ...img, alt: "" }]);
      } catch (e) {
        setUploadError(e.message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };
  const move = (i, d) =>
    setImages((prev) => {
      const next = [...prev];
      const j = i + d;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <form action={action} className="adm-form">
      {project && <input type="hidden" name="id" value={project.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <div className="adm-card adm-fields">
        <label>
          Project title *
          <input name="title" value={title} required onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} />
        </label>
        <label>
          Category *
          <select name="category" defaultValue={project?.category || ""} required>
            <option value="" disabled>Choose…</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <label>
          Web address
          <span className="adm-prefix"><span>/work/</span><input name="slug" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} /></span>
        </label>
        <label>
          Project link <span className="adm-muted">(optional — YouTube, VR tour, Google Drive… If filled in, clicking the project on the Work page opens this link directly)</span>
          <input name="link" type="url" placeholder="https://" defaultValue={project?.link || ""} />
        </label>
        <label className="adm-wide">
          Description <span className="adm-muted">(leave an empty line between paragraphs)</span>
          <textarea name="description" rows={7} defaultValue={project?.description || ""} />
        </label>
        <div className="adm-inline">
          <label className="adm-check"><input type="checkbox" name="published" defaultChecked={project ? project.published : true} /> Show on website</label>
          <label className="adm-small">Order <input name="sort" type="number" defaultValue={project?.sort ?? 0} /></label>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-head">
          <h2 className="adm-h2">Images *</h2>
          <button type="button" className="adm-btn ghost" onClick={() => fileInput.current?.click()}>+ Add images</button>
        </div>
        <p className="adm-muted">The first image is the cover on the Work page. Large photos are resized automatically.</p>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        <div
          className="adm-drop"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        >
          {images.length === 0 && !uploading && <p>Drag photos here or use “Add images”.</p>}
          <ul className="adm-images">
            {images.map((img, i) => (
              <li key={img.src} className="adm-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt="" />
                {i === 0 && <span className="adm-cover">Cover</span>}
                <input
                  aria-label="Image description"
                  placeholder="Short description (for accessibility)"
                  value={img.alt}
                  onChange={(e) => setImages((prev) => prev.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
                />
                <div className="adm-image-tools">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">←</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="Move later">→</button>
                  <button type="button" className="danger" onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}>Remove</button>
                </div>
              </li>
            ))}
            {Array.from({ length: uploading }, (_, i) => <li key={`up${i}`} className="adm-image loading">Uploading…</li>)}
          </ul>
        </div>
        {uploadError && <p className="adm-error" role="alert">{uploadError}</p>}
      </div>

      {state?.error && <p className="adm-error" role="alert">{state.error}</p>}
      <div className="adm-inline">
        <button className="adm-btn" type="submit" disabled={pending || uploading > 0}>{pending ? "Saving…" : uploading ? "Wait for uploads…" : "Save project"}</button>
        <Link className="adm-btn ghost" href="/admin/projects">Cancel</Link>
      </div>
    </form>
  );
}