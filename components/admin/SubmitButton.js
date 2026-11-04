"use client";

import { useFormStatus } from "react-dom";

// Button for the small admin forms (Hide, Mark as read, Delete…): shows a spinner while the action runs.
export default function SubmitButton({ className = "adm-btn ghost", confirmMessage, children }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`${className}${pending ? " is-busy" : ""}`}
      disabled={pending}
      onClick={(e) => {
        if (confirmMessage && !confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
