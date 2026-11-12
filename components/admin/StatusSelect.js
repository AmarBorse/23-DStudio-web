"use client";

import { useRef } from "react";
import { QUOTE_STATUSES } from "@/lib/quote";

// Status dropdown that saves as soon as it is changed
export default function StatusSelect({ id, status, action, options = QUOTE_STATUSES, label = "Status" }) {
  const form = useRef(null);
  return (
    <form ref={form} action={action} className="qa-status">
      <input type="hidden" name="id" value={id} />
      <select key={status} name="status" defaultValue={status} aria-label={label} className={`st-${status}`} onChange={() => form.current?.requestSubmit()}>
        {options.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
    </form>
  );
}
