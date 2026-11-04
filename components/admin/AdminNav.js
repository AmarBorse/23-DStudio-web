"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LinkSpinner from "@/components/admin/LinkSpinner";

// Sidebar links; the current section is highlighted
const links = [
  { href: "/admin", label: "Dashboard", icon: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { href: "/admin/projects", label: "Projects", icon: "M3 5h7v7H3zM14 5h7v7h-7zM3 15h7v5H3zM14 15h7v5h-7z" },
  { href: "/admin/team", label: "Team", icon: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 10c0-3.9 3.1-7 7-7s7 3.1 7 7M17 11a3 3 0 1 0 0-6M22 21c0-2.8-1.6-5.2-4-6.3" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 1 8 7 8-7" },
];

export default function AdminNav({ unread = 0 }) {
  const pathname = usePathname() || "";
  return (
    <nav className="adm-nav" aria-label="Admin">
      {links.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={l.icon} /></svg>
            <span>{l.label}</span>
            {l.href === "/admin/enquiries" && unread > 0 && <span className="adm-badge">{unread}</span>}
            <LinkSpinner />
          </Link>
        );
      })}
    </nav>
  );
}
