"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Wraps every page. Adds:
//  - a short brown "curtain" with the logo when moving between pages (not on the very first load),
//  - a thin reading-progress bar at the top of the window.
// Both are skipped in the admin, and for visitors who prefer reduced motion (see globals.css).
let firstLoad = true;

export default function Template({ children }) {
  const pathname = usePathname() || "";
  const isAdmin = pathname.startsWith("/admin");
  const [curtain] = useState(() => !firstLoad && !isAdmin);

  useEffect(() => {
    firstLoad = false;
  }, []);

  return (
    <>
      {curtain && (
        <div className="pt-curtain" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-white.png" alt="" width="64" height="61" />
        </div>
      )}
      {!isAdmin && <div className="scroll-progress" aria-hidden="true" />}
      {children}
    </>
  );
}
