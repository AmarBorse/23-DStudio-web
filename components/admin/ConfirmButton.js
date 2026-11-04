"use client";

import SubmitButton from "@/components/admin/SubmitButton";

export default function ConfirmButton({ message, children }) {
  return (
    <SubmitButton className="adm-btn danger" confirmMessage={message}>
      {children}
    </SubmitButton>
  );
}
