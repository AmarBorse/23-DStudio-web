import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { projects, team, enquiries } from "@/lib/store";
import CountUp from "@/components/admin/CountUp";

export default async function Dashboard() {
  await requireAdmin();
  const [p, t, e] = await Promise.all([projects.list(), team.list(), enquiries.list()]);
  const unread = e.filter((x) => !x.read);
  return (
    <>
      <h1 className="adm-h1">Dashboard</h1>
      <p className="adm-muted adm-sub">Welcome back. Here is what is happening on the website.</p>
      <div className="adm-stats">
        <Link href="/admin/projects" className="adm-card adm-stat"><strong><CountUp to={p.length} /></strong><span>Projects ({p.filter((x) => x.published).length} live)</span></Link>
        <Link href="/admin/team" className="adm-card adm-stat"><strong><CountUp to={t.length} /></strong><span>Team members</span></Link>
        <Link href="/admin/enquiries" className="adm-card adm-stat"><strong><CountUp to={unread.length} /></strong><span>New enquiries</span></Link>
      </div>
      <h2 className="adm-h2">Latest enquiries</h2>
      {e.length === 0 ? (
        <p className="adm-muted">No enquiries yet. Messages sent from the Contact page appear here.</p>
      ) : (
        <ul className="adm-list">
          {e.slice(0, 5).map((x) => (
            <li key={x.id}>
              <Link href="/admin/enquiries" className={`adm-card adm-row adm-row-link${x.read ? "" : " unread"}`}>
                <div className="adm-grow"><strong>{x.name}</strong> <span className="adm-muted">· {x.email}</span><p className="adm-snippet">{x.message}</p></div>
                <time className="adm-muted">{new Date(x.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</time>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="adm-dash-actions"><Link className="adm-btn" href="/admin/projects/new">+ Add a project</Link></p>
    </>
  );
}
