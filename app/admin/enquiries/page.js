import { requireAdmin } from "@/lib/auth";
import { enquiries } from "@/lib/store";
import { setEnquiryRead, deleteEnquiry } from "@/app/admin/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";

const fmt = (d) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export default async function EnquiriesAdmin() {
  await requireAdmin();
  const rows = await enquiries.list();
  const unread = rows.filter((r) => !r.read).length;
  return (
    <>
      <h1 className="adm-h1">Enquiries <span className="adm-muted">({unread} new)</span></h1>
      {rows.length === 0 && <p className="adm-muted">No enquiries yet. Messages sent from the Contact page appear here.</p>}
      <ul className="adm-list">
        {rows.map((r) => (
          <li key={r.id} className={`adm-card adm-enquiry${r.read ? "" : " unread"}`}>
            <div className="adm-enquiry-head">
              <div>
                <strong>{r.name}</strong>
                {!r.read && <span className="adm-pill live">New</span>}
                <div className="adm-muted">
                  <a href={`mailto:${r.email}`}>{r.email}</a>
                  {r.phone && <> · <a href={`tel:${r.phone.replace(/\s/g, "")}`}>{r.phone}</a></>}
                </div>
              </div>
              <time className="adm-muted">{fmt(r.created_at)}</time>
            </div>
            <p className="adm-message">{r.message}</p>
            <div className="adm-actions">
              <a className="adm-btn" href={`mailto:${r.email}?subject=${encodeURIComponent("Re: your enquiry to 23D Studio")}`}>Reply by email</a>
              <form action={setEnquiryRead}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="read" value={String(!r.read)} />
                <button className="adm-btn ghost" type="submit">{r.read ? "Mark as new" : "Mark as read"}</button>
              </form>
              <form action={deleteEnquiry}>
                <input type="hidden" name="id" value={r.id} />
                <ConfirmButton message="Delete this enquiry?">Delete</ConfirmButton>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
