import Link from "next/link";
import Image from "next/image";
import { isAdmin } from "@/lib/auth";
import { backend } from "@/lib/store";
import { enquiries } from "@/lib/store";
import { logout } from "@/app/admin/actions";
import "./admin.css";

export const metadata = { title: "Admin — 23D Studio", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const loggedIn = await isAdmin();
  if (!loggedIn) return <div className="adm adm-guest">{children}</div>;

  let unread = 0;
  try {
    unread = (await enquiries.list({ read: false })).length;
  } catch {}

  return (
    <div className="adm">
      <aside className="adm-side">
        <Link href="/admin" className="adm-brand">
          <Image src="/images/logo-white.png" alt="23D Studio" width={44} height={42} />
          <span>Admin</span>
        </Link>
        <nav className="adm-nav">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/projects">Projects</Link>
          <Link href="/admin/team">Team</Link>
          <Link href="/admin/enquiries">
            Enquiries {unread > 0 && <span className="adm-badge">{unread}</span>}
          </Link>
        </nav>
        <div className="adm-side-foot">
          <a href="/" target="_blank" rel="noopener noreferrer">View website ↗</a>
          <form action={logout}>
            <button type="submit">Log out</button>
          </form>
          {backend === "file" && <p className="adm-warn">Local mode: data is saved on this computer (.data folder).</p>}
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
