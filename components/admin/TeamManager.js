"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveMember, deleteMember } from "@/app/admin/actions";
import { uploadImage } from "@/components/admin/upload";
import ConfirmButton from "@/components/admin/ConfirmButton";

function MemberForm({ member, nextSort, onDone }) {
  const [state, action, pending] = useActionState(saveMember, null);
  const [photo, setPhoto] = useState(member?.photo || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const file = useRef(null);
  const form = useRef(null);

  useEffect(() => {
    if (state?.ok) {
      if (!member) { form.current?.reset(); setPhoto(""); }
      onDone?.();
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = async (f) => {
    if (!f) return;
    setErr(""); setBusy(true);
    try { setPhoto((await uploadImage(f)).src); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <form ref={form} action={action} className="adm-card adm-member-form">
      {member && <input type="hidden" name="id" value={member.id} />}
      <input type="hidden" name="photo" value={photo} />
      <button type="button" className="adm-member-photo" onClick={() => file.current?.click()} aria-label={photo ? "Change photo" : "Add photo"}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {photo ? <img src={photo} alt="" /> : <span>{busy ? "Uploading…" : "+ Photo"}</span>}
      </button>
      <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { pick(e.target.files[0]); e.target.value = ""; }} />
      <div className="adm-fields">
        <label>Name *<input name="name" defaultValue={member?.name || ""} required /></label>
        <label>Role<input name="role" defaultValue={member?.role || ""} placeholder="e.g. 3D Artist" /></label>
        <label className="adm-small">Order<input name="sort" type="number" defaultValue={member?.sort ?? nextSort} /></label>
      </div>
      {(err || state?.error) && <p className="adm-error" role="alert">{err || state.error}</p>}
      {state?.ok && !member && <p className="adm-ok adm-toast" role="status" key={state.at}>Saved. The About page is updated.</p>}
      <div className="adm-inline">
        <button className={`adm-btn${pending ? " is-busy" : ""}`} type="submit" disabled={pending || busy}>{pending ? "Saving…" : member ? "Save" : "Add member"}</button>
        {member && <button type="button" className="adm-btn ghost" onClick={onDone}>Cancel</button>}
      </div>
    </form>
  );
}

export default function TeamManager({ members }) {
  const [editing, setEditing] = useState(null);
  return (
    <>
      <ul className="adm-team">
        {members.map((m) =>
          editing === m.id ? (
            <li key={m.id}><MemberForm member={m} onDone={() => setEditing(null)} /></li>
          ) : (
            <li key={m.id} className="adm-card adm-member">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.photo} alt="" />
              <strong>{m.name}</strong>
              <span className="adm-muted">{m.role}</span>
              <div className="adm-actions">
                <button className="adm-btn ghost" type="button" onClick={() => setEditing(m.id)}>Edit</button>
                <form action={deleteMember}>
                  <input type="hidden" name="id" value={m.id} />
                  <ConfirmButton message={`Remove ${m.name} from the team?`}>Delete</ConfirmButton>
                </form>
              </div>
            </li>
          )
        )}
      </ul>
      <h2 className="adm-h2">Add a team member</h2>
      <MemberForm nextSort={members.length} />
    </>
  );
}
