"use client";

import { useState } from "react";
import { EMAIL, LOCATION, SOCIAL } from "@/components/contactInfo";

const icons = {
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.6-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M6.9 8.9H3.8V20h3.1V8.9zM5.3 4a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6zM20.2 13.6c0-3-1.6-4.9-4.3-4.9-1.4 0-2.4.8-2.8 1.5V8.9h-3V20h3.1v-5.8c0-1.5.6-2.6 2-2.6s1.9 1 1.9 2.6V20h3.1v-6.4z" />
    </svg>
  ),
};

const fields = [
  { k: "name", label: "Your name", required: true, props: { autoComplete: "name" }, wide: true },
  { k: "email", label: "Email address", required: true, props: { type: "email", autoComplete: "email", inputMode: "email" } },
  { k: "phone", label: "Phone (optional)", props: { type: "tel", autoComplete: "tel", inputMode: "tel" } },
  { k: "message", label: "Tell us about your project", required: true, textarea: true, wide: true },
];

const empty = { name: "", email: "", phone: "", message: "" };

export default function ContactSection() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => {
    setSent(false);
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) er.email = "Please enter a valid email address.";
    if (form.phone.trim() && !/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) er.phone = "Please check the phone number.";
    if (!form.message.trim()) er.message = "Please tell us a little about your project.";
    return er;
  };

  // Saves the message for the admin Enquiries box (/admin/enquiries)
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const onSubmit = async (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    setSendError("");
    if (Object.keys(er).length) {
      document.getElementById(`cf-${Object.keys(er)[0]}`)?.focus();
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website: e.currentTarget.website?.value || "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Sorry, your message could not be sent.");
      setSent(true);
      setForm(empty);
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="ct" aria-labelledby="ct-title">
      <div className="wrap">
        <div className="ct-card">
          {/* ---- left: studio details ---- */}
          <div className="ct-info" data-anim="wipe-right">
            <div className="ct-plan" aria-hidden="true" />
            <div className="ct-info-top">
              <p className="ct-kicker" data-anim="fade-up" style={{ "--d": "0.35s" }}>Get in touch</p>
              <h2 className="ct-title" id="ct-title" data-anim="fade-up" style={{ "--d": "0.45s" }}>
                Let&apos;s talk about your project.
              </h2>
              <p className="ct-intro" data-anim="fade-up" style={{ "--d": "0.55s" }}>
                Share a few details about what you are planning — renders, a walkthrough or a VR tour — and we will get back to you.
              </p>
            </div>

            <div className="ct-info-bottom">
              <a className="ct-email" href={`mailto:${EMAIL}`} data-anim="fade-up" style={{ "--d": "0.65s" }}>
                {EMAIL}
              </a>
              <p className="ct-location" data-anim="fade-up" style={{ "--d": "0.72s" }}>{LOCATION}</p>
              <ul className="ct-social" aria-label="23D Studio on social media">
                {["instagram", "facebook", "linkedin"].map((k, i) => (
                  <li key={k} data-anim="fade-up" style={{ "--d": `${0.8 + i * 0.08}s` }}>
                    <a href={SOCIAL[k]} target="_blank" rel="noopener noreferrer" aria-label={k[0].toUpperCase() + k.slice(1)}>
                      {icons[k]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ---- right: form ---- */}
          <form className="cf" onSubmit={onSubmit} noValidate>
            <h3 className="cf-head" data-anim="fade-up" style={{ "--d": "0.3s" }}>Send us a message</h3>

            <div className="cf-grid">
              {fields.map((f, i) => {
                const Tag = f.textarea ? "textarea" : "input";
                return (
                  <div
                    key={f.k}
                    className={`cf-field${f.wide ? " wide" : ""}${errors[f.k] ? " has-error" : ""}`}
                    data-anim="fade-up"
                    style={{ "--d": `${0.4 + i * 0.1}s` }}
                  >
                    <Tag
                      id={`cf-${f.k}`}
                      name={f.k}
                      value={form[f.k]}
                      onChange={set(f.k)}
                      placeholder=" "
                      rows={f.textarea ? 4 : undefined}
                      aria-invalid={errors[f.k] ? "true" : undefined}
                      aria-describedby={errors[f.k] ? `cf-${f.k}-err` : undefined}
                      aria-required={f.required ? "true" : undefined}
                      {...f.props}
                    />
                    <label htmlFor={`cf-${f.k}`}>
                      {f.label}
                      {f.required && <span aria-hidden="true"> *</span>}
                    </label>
                    {errors[f.k] && (
                      <p className="cf-error" id={`cf-${f.k}-err`}>
                        {errors[f.k]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* hidden from people; bots that fill it in are ignored */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="cf-hp" aria-hidden="true" />

            <div className="cf-actions" data-anim="fade-up" style={{ "--d": "0.85s" }}>
              <button type="submit" className="pill pill-dark cf-submit" disabled={sending}>
                <span>{sending ? "Sending…" : "Send Message"}</span>
                <span className="arr">➔</span>
              </button>
              <p className={`cf-note${sent ? " sent" : ""}${sendError ? " failed" : ""}`} role="status">
                {sent ? (
                  <>
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                      <circle cx="10" cy="10" r="9" />
                      <path d="M5.8 10.3l2.7 2.7 5.7-5.9" />
                    </svg>
                    Thank you — your message has been sent. We will get back to you soon.
                  </>
                ) : sendError ? (
                  <>
                    {sendError} You can also email us at&nbsp;<a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
                  </>
                ) : (
                  "We will reply to the email address you enter."
                )}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
