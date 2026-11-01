"use client";

export default function ConfirmButton({ message, children }) {
  return (
    <button className="adm-btn danger" type="submit" onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
