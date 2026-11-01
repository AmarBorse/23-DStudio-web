"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="adm-card adm-login-form">
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
      {state?.error && <p className="adm-error shake" role="alert" key={Date.now()}>{state.error}</p>}
      <button className={`adm-btn${pending ? " is-busy" : ""}`} type="submit" disabled={pending}>{pending ? "Checking…" : "Log in"}</button>
    </form>
  );
}
