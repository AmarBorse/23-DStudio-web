"use client";

import { useLinkStatus } from "next/link";

// Put inside a <Link>: shows a small spinner from the moment it is clicked until the new page is ready
export default function LinkSpinner() {
  const { pending } = useLinkStatus();
  return <span className={`adm-link-spin${pending ? " on" : ""}`} aria-hidden="true" />;
}
