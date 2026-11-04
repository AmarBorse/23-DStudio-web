"use client";

export default function PrintButton({ label = "Print / Save PDF" }) {
  return (
    <button type="button" className="adm-btn" onClick={() => window.print()}>
      {label}
    </button>
  );
}
