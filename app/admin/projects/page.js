import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { projects } from "@/lib/store";
import { CATEGORIES } from "@/lib/categories";
import { deleteProject, toggleProject } from "@/app/admin/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";

export default async function ProjectsAdmin({ searchParams }) {
  await requireAdmin();
  const { saved } = await searchParams;
  const rows = await projects.list();
  return (
    <>
      <div className="adm-head">
        <h1 className="adm-h1">Projects</h1>
        <Link className="adm-btn" href="/admin/projects/new">+ Add project</Link>
      </div>
      {saved && <p className="adm-ok" role="status">Saved. The website is updated.</p>}
      {CATEGORIES.map((c) => {
        const list = rows.filter((p) => p.category === c.id);
        return (
          <section key={c.id} className="adm-group">
            <h2 className="adm-h2">{c.label} <span className="adm-muted">({list.length})</span></h2>
            {list.length === 0 && <p className="adm-muted">No projects in this category yet.</p>}
            <ul className="adm-list">
              {list.map((p) => (
                <li key={p.id} className="adm-card adm-row">
                  <div className="adm-thumb">{p.images?.[0] && <Image src={p.images[0].src} alt="" fill sizes="96px" />}</div>
                  <div className="adm-grow">
                    <strong>{p.title}</strong>
                    <div className="adm-muted">
                      /work/{p.slug} · {p.images?.length || 0} image{p.images?.length === 1 ? "" : "s"}
                      {p.link && " · has link"}
                    </div>
                  </div>
                  <span className={`adm-pill ${p.published ? "live" : "draft"}`}>{p.published ? "Live" : "Hidden"}</span>
                  <div className="adm-actions">
                    <Link className="adm-btn ghost" href={`/admin/projects/${p.id}`}>Edit</Link>
                    <form action={toggleProject}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="published" value={String(!p.published)} />
                      <button className="adm-btn ghost" type="submit">{p.published ? "Hide" : "Publish"}</button>
                    </form>
                    {p.published && <a className="adm-btn ghost" href={`/work/${p.slug}`} target="_blank" rel="noopener noreferrer">View ↗</a>}
                    <form action={deleteProject}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmButton message={`Delete “${p.title}”? This cannot be undone.`}>Delete</ConfirmButton>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
