"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LinkSpinner from "@/components/admin/LinkSpinner";

// Sidebar links; the current section is highlighted
const links = [
  { href: "/admin", label: "Dashboard", icon: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { href: "/admin/projects", label: "Projects", icon: "M3 5h7v7H3zM14 5h7v7h-7zM3 15h7v5H3zM14 15h7v5h-7z" },
  { href: "/admin/team", label: "Team", icon: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 10c0-3.9 3.1-7 7-7s7 3.1 7 7M17 11a3 3 0 1 0 0-6M22 21c0-2.8-1.6-5.2-4-6.3" },
  { href: "/admin/quotations", label: "Quotations", icon: "M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5M9 13h6M9 17h6M9 9h2" },
  { href: "/admin/invoices", label: "Invoices", icon: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3" },
  { href: "/admin/offers", label: "Offer letters", icon: "M6 3h12v11M6 3v18h7M9 8h6M9 12h4M17 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm-1.5 5.4L15 23l2-1 2 1-.5-3.6" },
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
