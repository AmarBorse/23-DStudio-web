"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, startSession, endSession, requireAdmin, loginConfigured } from "@/lib/auth";
import { projects, team, enquiries, quotations, invoices, offerLetters } from "@/lib/store";
import { nextOfferNumber, offerStatusLabel } from "@/lib/offer";
import { nextInvoiceNumber, invoiceStatusLabel, invoiceTotals } from "@/lib/invoice";
import { nextQuoteNumber, todayISO, addDays, changedFields, historyEntry, statusLabel } from "@/lib/quote";
import { QUOTE_DEFAULTS, INVOICE_DEFAULTS, OFFER_DEFAULTS } from "@/lib/company";
import { CATEGORIES } from "@/lib/categories";
import { refreshPublicPages } from "@/lib/revalidate";

/* ---------- login ---------- */
export async function login(_prev, formData) {
  if (!loginConfigured()) return { error: "Admin login is not set up yet (ADMIN_PASSWORD is missing)." };
  await new Promise((r) => setTimeout(r, 400)); // slows down password guessing
  if (!checkPassword(String(formData.get("password") || ""))) return { error: "Wrong password." };
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/* ---------- projects ---------- */
const slugify = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export async function saveProject(_prev, formData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const caption = String(formData.get("caption") || "").trim();
  const category = String(formData.get("category") || "");
  const description = String(formData.get("description") || "").trim();
  const link = String(formData.get("link") || "").trim();
  const published = formData.get("published") === "on";
  const has_page = formData.get("has_page") === "on";
  const sort = Number(formData.get("sort") || 0) || 0;
  let slug = slugify(String(formData.get("slug") || "") || title);
  const parse = (k, fallback) => {
    try {
      return JSON.parse(String(formData.get(k) || "")) ?? fallback;
    } catch {
      return fallback;
    }
  };
  const cleanImage = (im) => {
    if (!im?.src) return null;
    const out = { src: String(im.src), w: Number(im.w) || 1600, h: Number(im.h) || 900, alt: String(im.alt || title) };
    if (["full", "half"].includes(im.layout)) out.layout = im.layout; // gallery: full width or side by side
    if (im.text_after) out.text_after = true; // the description is shown below this image
    if (Number.isFinite(Number(im.gap)) && im.gap !== "" && im.gap !== null) out.gap = Math.min(200, Math.max(0, Number(im.gap))); // space above, from the PDF
    return out;
  };
  const images = parse("images", []).map(cleanImage).filter(Boolean);
  const card_image = cleanImage(parse("card_image", null));

  if (!title) return { error: "Please enter a project name." };
  if (!CATEGORIES.some((c) => c.id === category)) return { error: "Please choose a service (Our Work tab)." };
  if (link && !/^https?:\/\/\S+$/i.test(link)) return { error: "The project link must start with http:// or https://" };
  if (has_page && !images.length) return { error: "Please add a main image for the project page." };
  if (!has_page && !link) return { error: "Without a project page, please add a project link (or tick “Create a project page”)." };
  if (!card_image && !images.length) return { error: "Please add an Our Work page image." };
  if (!slug) return { error: "Please enter a page address." };

  const clash = await projects.get("slug", slug);
  if (clash && clash.id !== id) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const row = { title, caption, slug, category, description, link, published, has_page, sort, images, card_image };
  try {
    if (id) await projects.update(id, row);
    else await projects.insert(row);
  } catch (e) {
    console.error(e);
    const msg = String(e.message || "");
    if (/column|card_image|has_page|caption/i.test(msg)) return { error: "The database needs the latest update: run supabase/update-2.sql in the Supabase SQL Editor." };
    return { error: "Could not save. Is the database connected?" };
  }
  refreshPublicPages();
  revalidatePath("/admin/projects");
  redirect("/admin/projects?saved=1");
}

export async function deleteProject(formData) {
  await requireAdmin();
  await projects.remove(String(formData.get("id")));
  refreshPublicPages();
  revalidatePath("/admin/projects");
}

export async function toggleProject(formData) {
  await requireAdmin();
  await projects.update(String(formData.get("id")), { published: formData.get("published") === "true" });
  refreshPublicPages();
  revalidatePath("/admin/projects");
}

/* ---------- team ---------- */
export async function saveMember(_prev, formData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const row = {
    name: String(formData.get("name") || "").trim(),
    role: String(formData.get("role") || "").trim(),
    photo: String(formData.get("photo") || ""),
    sort: Number(formData.get("sort") || 0) || 0,
  };
  if (!row.name) return { error: "Please enter a name." };
  if (!row.photo) return { error: "Please add a photo." };
  try {
    if (id) await team.update(id, row);
    else await team.insert(row);
  } catch (e) {
    console.error(e);
    return { error: "Could not save. Is the database connected?" };
  }
  refreshPublicPages();
  revalidatePath("/admin/team");
  return { ok: true, at: Date.now() };
}

export async function deleteMember(formData) {
  await requireAdmin();
  await team.remove(String(formData.get("id")));
  refreshPublicPages();
  revalidatePath("/admin/team");
}

/* ---------- enquiries ---------- */
export async function setEnquiryRead(formData) {
  await requireAdmin();
  await enquiries.update(String(formData.get("id")), { read: formData.get("read") === "true" });
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

export async function deleteEnquiry(formData) {
  await requireAdmin();
  await enquiries.remove(String(formData.get("id")));
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

/* ---------- quotations ---------- */
const QUOTE_STATUS_IDS = ["draft", "sent", "accepted", "rejected"];

export async function saveQuote(_prev, formData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const text = (k, max = 2000) => String(formData.get(k) || "").trim().slice(0, max);
  const money = (v) => Math.max(0, Math.round((Number(v) || 0) * 100) / 100);
  let items = [];
  try {
    items = JSON.parse(String(formData.get("items") || "[]"));
  } catch {}
  items = items
    .map((it) => ({ description: String(it.description || "").trim().slice(0, 1000), qty: money(it.qty), unit: String(it.unit || "").trim().slice(0, 20), rate: money(it.rate) }))
    .filter((it) => it.description);

  const row = {
    number: text("number", 30),
    quote_date: text("quote_date", 10) || null,
    valid_till: text("valid_till", 10) || null,
    customer_id: text("customer_id", 30),
    client_name: text("client_name", 200),
    client_address: text("client_address", 500),
    client_phone: text("client_phone", 40),
    client_email: text("client_email", 200),
    prepared_by_name: text("prepared_by_name", 120),
    prepared_by_phone: text("prepared_by_phone", 40),
    project_overview: text("project_overview", 1000),
    items,
    gst_enabled: formData.get("gst_enabled") === "on",
    gst_percent: money(formData.get("gst_percent")),
    discount: money(formData.get("discount")),
    terms: text("terms", 5000),
    closing: text("closing", 300),
    notes: text("notes", 2000),
    status: QUOTE_STATUS_IDS.includes(text("status")) ? text("status") : "draft",
  };
  if (!row.number) return { error: "Please enter a quote number." };
  if (!row.client_name) return { error: "Please enter the client’s name (Contact Person)." };
  if (!items.length) return { error: "Please add at least one item with a description." };
  if (!row.quote_date) return { error: "Please choose the quote date." };

  let saved;
  try {
    const all = await quotations.list();
    const same = all.find((x) => x.number === row.number && x.id !== id);
    if (same) return { error: `Quote number ${row.number} is already used (client: ${same.client_name}). Please use another number.` };
    if (id) {
      const before = all.find((x) => x.id === id);
      const history = Array.isArray(before?.history) ? [...before.history] : [historyEntry("created")].map((h) => ({ ...h, at: before?.created_at || h.at }));
      const changed = changedFields(before, row);
      if (changed.length) history.push(historyEntry("edited", changed.join(", ")));
      if (before && before.status !== row.status) history.push(historyEntry("status", `${statusLabel(before.status)} → ${statusLabel(row.status)}`));
      saved = await quotations.update(id, { ...row, history });
    } else {
      saved = await quotations.insert({ ...row, history: [historyEntry("created", `Status: ${statusLabel(row.status)}`)] });
    }
  } catch (e) {
    console.error(e);
    if (/history/i.test(String(e.message))) return { error: "The database needs the history update: run supabase/update-4.sql in the Supabase SQL Editor." };
    if (/quotations|relation|column/i.test(String(e.message))) return { error: "The database needs the quotations update: run supabase/update-3.sql in the Supabase SQL Editor." };
    return { error: "Could not save. Is the database connected?" };
  }
  revalidatePath("/admin/quotations");
  revalidatePath("/admin");
  redirect(formData.get("then") === "print" ? `/admin/quotations/${saved.id}/print` : "/admin/quotations?saved=1");
}

export async function setQuoteStatus(formData) {
  await requireAdmin();
  const status = String(formData.get("status"));
  if (!QUOTE_STATUS_IDS.includes(status)) return;
  const id = String(formData.get("id"));
  const before = await quotations.get("id", id);
  if (!before || before.status === status) return;
  const history = [...(Array.isArray(before.history) ? before.history : [{ ...historyEntry("created"), at: before.created_at }])];
  history.push(historyEntry("status", `${statusLabel(before.status)} → ${statusLabel(status)}`));
  await quotations.update(id, { status, history });
  revalidatePath("/admin/quotations");
}

export async function deleteQuote(formData) {
  await requireAdmin();
  await quotations.remove(String(formData.get("id")));
  revalidatePath("/admin/quotations");
  revalidatePath("/admin");
}

export async function duplicateQuote(formData) {
  await requireAdmin();
  const q = await quotations.get("id", String(formData.get("id")));
  if (!q) return;
  const all = await quotations.list();
  const { id: _id, created_at: _c, ...rest } = q;
  const today = todayISO();
  const number = nextQuoteNumber(all);
  const copy = await quotations.insert({
    ...rest,
    number,
    quote_date: today,
    valid_till: addDays(today, QUOTE_DEFAULTS.validDays),
    status: "draft",
    history: [historyEntry("created", `Copied from quote ${q.number}`)],
  });
  const origHistory = [...(Array.isArray(q.history) ? q.history : [{ ...historyEntry("created"), at: q.created_at }])];
  origHistory.push(historyEntry("duplicated", `Copied to new quote ${number}`));
  await quotations.update(q.id, { history: origHistory });
  revalidatePath("/admin/quotations");
  redirect(`/admin/quotations/${copy.id}`);
}


/* ---------- invoices ---------- */
const INVOICE_STATUS_IDS = ["unpaid", "partly_paid", "paid", "cancelled"];
const withHistory = (row, entry) => [...(Array.isArray(row?.history) && row.history.length ? row.history : [{ ...historyEntry("created"), at: row?.created_at || new Date().toISOString() }]), entry];
const INVOICE_LABELS = {
  number: "Invoice No", invoice_date: "Date", due_date: "Due date", client_name: "Billed to", client_address: "Address",
  client_phone: "Client phone", client_email: "Client email", heading: "Heading", items: "Items", discount: "Discount",
  gst_enabled: "GST", gst_percent: "GST %", notes: "Notes", bank: "Bank details", closing: "Closing line", private_notes: "Private notes",
  amount_paid: "Amount received", paid_on: "Payment date", customer_id: "Customer Id",
};
const invoiceChanges = (a, b) =>
  Object.keys(INVOICE_LABELS).filter((k) => JSON.stringify(a?.[k] ?? "") !== JSON.stringify(b?.[k] ?? "")).map((k) => INVOICE_LABELS[k]);

export async function saveInvoice(_prev, formData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const text = (k, max = 2000) => String(formData.get(k) || "").trim().slice(0, max);
  const money = (v) => Math.max(0, Math.round((Number(v) || 0) * 100) / 100);
  const optMoney = (v) => (v === "" || v === null || v === undefined ? "" : money(v));
  let items = [];
  try {
    items = JSON.parse(String(formData.get("items") || "[]"));
  } catch {}
  items = items
    .map((it) => ({
      description: String(it.description || "").trim().slice(0, 1000),
      qty: optMoney(it.qty),
      rate: optMoney(it.rate),
      amount: optMoney(it.amount),
      included: Boolean(it.included),
    }))
    .filter((it) => it.description);

  const row = {
    number: text("number", 30),
    invoice_date: text("invoice_date", 10) || null,
    due_date: text("due_date", 10) || null,
    quote_id: text("quote_id", 60) || null,
    quote_number: text("quote_number", 30),
    customer_id: text("customer_id", 30),
    client_name: text("client_name", 200),
    client_address: text("client_address", 500),
    client_phone: text("client_phone", 40),
    client_email: text("client_email", 200),
    heading: text("heading", 200),
    items,
    discount: money(formData.get("discount")),
    gst_enabled: formData.get("gst_enabled") === "on",
    gst_percent: money(formData.get("gst_percent")),
    notes: text("notes", 5000),
    bank: text("bank", 2000),
    closing: text("closing", 300),
    private_notes: text("private_notes", 2000),
    status: INVOICE_STATUS_IDS.includes(text("status")) ? text("status") : "unpaid",
    amount_paid: money(formData.get("amount_paid")),
    paid_on: text("paid_on", 10) || null,
  };
  if (!row.number) return { error: "Please enter an invoice number." };
  if (!row.client_name) return { error: "Please enter who the invoice is billed to." };
  if (!items.length) return { error: "Please add at least one item with a description." };
  if (!row.invoice_date) return { error: "Please choose the invoice date." };
  if (row.status === "paid" && !row.paid_on) row.paid_on = todayISO();

  let saved;
  try {
    const all = await invoices.list();
    const same = all.find((x) => x.number === row.number && x.id !== id);
    if (same) return { error: `Invoice number ${row.number} is already used (billed to ${same.client_name}). Please use another number.` };
    if (id) {
      const before = all.find((x) => x.id === id);
      let history = Array.isArray(before?.history) ? [...before.history] : [];
      const changed = invoiceChanges(before, row);
      if (changed.length) history = withHistory({ ...before, history }, historyEntry("edited", changed.join(", ")));
      if (before && before.status !== row.status) history = withHistory({ ...before, history }, historyEntry("status", `${invoiceStatusLabel(before.status)} → ${invoiceStatusLabel(row.status)}`));
      saved = await invoices.update(id, { ...row, history });
    } else {
      const first = historyEntry("created", row.quote_number ? `From quote ${row.quote_number}` : `Status: ${invoiceStatusLabel(row.status)}`);
      saved = await invoices.insert({ ...row, history: [first] });
      if (row.quote_id) {
        const q = await quotations.get("id", row.quote_id).catch(() => null);
        if (q) await quotations.update(q.id, { history: withHistory(q, historyEntry("invoiced", `Invoice ${row.number} created`)) });
      }
    }
  } catch (e) {
    console.error(e);
    if (/invoices|relation|column/i.test(String(e.message))) return { error: "The database needs the invoices update: run supabase/update-5.sql in the Supabase SQL Editor." };
    return { error: "Could not save. Is the database connected?" };
  }
  revalidatePath("/admin/invoices");
  revalidatePath("/admin/quotations");
  revalidatePath("/admin");
  redirect(formData.get("then") === "print" ? `/admin/invoices/${saved.id}/print` : "/admin/invoices?saved=1");
}

export async function setInvoiceStatus(formData) {
  await requireAdmin();
  const status = String(formData.get("status"));
  if (!INVOICE_STATUS_IDS.includes(status)) return;
  const inv = await invoices.get("id", String(formData.get("id")));
  if (!inv || inv.status === status) return;
  const patch = { status, history: withHistory(inv, historyEntry("status", `${invoiceStatusLabel(inv.status)} → ${invoiceStatusLabel(status)}`)) };
  if (status === "paid") {
    patch.amount_paid = invoiceTotals({ ...inv, status: "unpaid" }).total;
    if (!inv.paid_on) patch.paid_on = todayISO();
  }
  await invoices.update(inv.id, patch);
  revalidatePath("/admin/invoices");
  revalidatePath("/admin");
}

export async function deleteInvoice(formData) {
  await requireAdmin();
  await invoices.remove(String(formData.get("id")));
  revalidatePath("/admin/invoices");
  revalidatePath("/admin");
}

export async function duplicateInvoice(formData) {
  await requireAdmin();
  const inv = await invoices.get("id", String(formData.get("id")));
  if (!inv) return;
  const all = await invoices.list();
  const { id: _id, created_at: _c, ...rest } = inv;
  const number = nextInvoiceNumber(all);
  const copy = await invoices.insert({
    ...rest,
    number,
    invoice_date: todayISO(),
    due_date: null,
    quote_id: null,
    quote_number: "",
    status: "unpaid",
    amount_paid: 0,
    paid_on: null,
    history: [historyEntry("created", `Copied from invoice ${inv.number}`)],
  });
  await invoices.update(inv.id, { history: withHistory(inv, historyEntry("duplicated", `Copied to new invoice ${number}`)) });
  revalidatePath("/admin/invoices");
  redirect(`/admin/invoices/${copy.id}`);
}


/* ---------- offer letters ---------- */
const OFFER_STATUS_IDS = ["draft", "sent", "accepted", "declined", "withdrawn"];
const OFFER_LABELS = {
  number: "Ref No", letter_date: "Date", candidate_name: "Candidate", candidate_address: "Address", candidate_email: "Email",
  candidate_phone: "Phone", greeting_name: "Greeting", position: "Position", start_date: "Joining date", reporting_to: "Reports to",
  work_location: "Location", salary: "Salary", benefits: "Benefits", accept_by: "Accept by", body: "Letter text", closing: "Closing",
  signatory_name: "Signed by", signatory_title: "Signatory title", signature: "Signature", private_notes: "Private notes",
  letter_type: "Letter type", department: "Department", end_date: "End date", duration: "Duration", work_mode: "Work mode",
  working_hours: "Working hours", notice: "Notice period", about: "About text", responsibilities: "Responsibilities", terms: "Terms",
};
const offerChanges = (a, b) =>
  Object.keys(OFFER_LABELS).filter((k) => JSON.stringify(a?.[k] ?? "") !== JSON.stringify(b?.[k] ?? "")).map((k) => OFFER_LABELS[k]);

export async function saveOffer(_prev, formData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const text = (k, max = 300) => String(formData.get(k) || "").trim().slice(0, max);
  const date = (k) => text(k, 10) || null;
  const signature = text("signature", 1000);
  const row = {
    number: text("number", 30),
    letter_date: date("letter_date"),
    candidate_name: text("candidate_name", 200),
    candidate_address: text("candidate_address", 500),
    candidate_email: text("candidate_email", 200),
    candidate_phone: text("candidate_phone", 40),
    greeting_name: text("greeting_name", 80),
    position: text("position", 150),
    start_date: date("start_date"),
    reporting_to: text("reporting_to", 150),
    work_location: text("work_location", 150),
    salary: text("salary", 100),
    benefits: text("benefits", 400),
    accept_by: date("accept_by"),
    body: text("body", 6000),
    closing: text("closing", 80),
    signatory_name: text("signatory_name", 120),
    signatory_title: text("signatory_title", 120),
    signature: /^(https:\/\/|\/media\/|\/images\/)/.test(signature) ? signature : "",
    private_notes: text("private_notes", 2000),
    status: OFFER_STATUS_IDS.includes(text("status")) ? text("status") : "draft",
    letter_type: ["internship", "completion"].includes(text("letter_type")) ? text("letter_type") : "job",
    department: text("department", 120),
    end_date: date("end_date"),
    duration: text("duration", 60),
    work_mode: text("work_mode", 120),
    working_hours: text("working_hours", 120),
    notice: text("notice", 60),
    about: text("about", 2000),
    responsibilities: text("responsibilities", 4000),
    terms: text("terms", 10000),
  };
  if (row.letter_type !== "job" && row.start_date && row.end_date && row.end_date < row.start_date)
    return { error: "The internship end date is before the start date." };
  if (row.letter_type === "completion" && (!row.start_date || !row.end_date))
    return { error: "Please enter the internship start and end dates." };
  if (row.letter_type === "completion" && row.end_date && row.letter_date && row.letter_date < row.end_date)
    return { error: "A completion letter can only be dated on or after the internship’s end date." };
  if (!row.number) return { error: "Please enter a reference number." };
  if (!row.candidate_name) return { error: "Please enter the candidate’s name." };
  if (!row.position) return { error: "Please enter the position." };
  if (!row.letter_date) return { error: "Please choose the letter date." };
  if (!row.body) return { error: "The letter text is empty." };

  let saved;
  try {
    const all = await offerLetters.list();
    const same = all.find((x) => x.number === row.number && x.id !== id);
    if (same) return { error: `Reference ${row.number} is already used (${same.candidate_name}). Please use another number.` };
    if (id) {
      const before = all.find((x) => x.id === id);
      let history = Array.isArray(before?.history) ? [...before.history] : [];
      const changed = offerChanges(before, row);
      if (changed.length) history = withHistory({ ...before, history }, historyEntry("edited", changed.join(", ")));
      if (before && before.status !== row.status) history = withHistory({ ...before, history }, historyEntry("status", `${offerStatusLabel(before.status)} → ${offerStatusLabel(row.status)}`));
      saved = await offerLetters.update(id, { ...row, history });
    } else {
      const from = text("source_number", 30);
      saved = await offerLetters.insert({ ...row, history: [historyEntry("created", `${row.position} · ${offerStatusLabel(row.status)}${from ? ` · from internship offer ${from}` : ""}`)] });
    }
  } catch (e) {
    console.error(e);
    if (/letter_type|department|end_date|work_mode|working_hours|notice|responsibilities|terms|about/i.test(String(e.message)))
      return { error: "The database needs the internship update: run supabase/update-7.sql in the Supabase SQL Editor." };
    if (/offer_letters|relation|column/i.test(String(e.message))) return { error: "The database needs the offer letters update: run supabase/update-6.sql in the Supabase SQL Editor." };
    return { error: "Could not save. Is the database connected?" };
  }
  revalidatePath("/admin/offers");
  redirect(formData.get("then") === "print" ? `/admin/offers/${saved.id}/print` : "/admin/offers?saved=1");
}

export async function setOfferStatus(formData) {
  await requireAdmin();
  const status = String(formData.get("status"));
  if (!OFFER_STATUS_IDS.includes(status)) return;
  const o = await offerLetters.get("id", String(formData.get("id")));
  if (!o || o.status === status) return;
  await offerLetters.update(o.id, { status, history: withHistory(o, historyEntry("status", `${offerStatusLabel(o.status)} → ${offerStatusLabel(status)}`)) });
  revalidatePath("/admin/offers");
}

export async function deleteOffer(formData) {
  await requireAdmin();
  await offerLetters.remove(String(formData.get("id")));
  revalidatePath("/admin/offers");
}

export async function duplicateOffer(formData) {
  await requireAdmin();
  const o = await offerLetters.get("id", String(formData.get("id")));
  if (!o) return;
  const all = await offerLetters.list();
  const { id: _id, created_at: _c, ...rest } = o;
  const number = nextOfferNumber(all, ["internship", "completion"].includes(o.letter_type) ? o.letter_type : "job");
  const today = todayISO();
  const copy = await offerLetters.insert({
    ...rest,
    number,
    letter_date: today,
    accept_by: addDays(today, OFFER_DEFAULTS.acceptDays),
    candidate_name: "",
    candidate_address: "",
    candidate_email: "",
    candidate_phone: "",
    greeting_name: "",
    status: "draft",
    history: [historyEntry("created", `Copied from ${o.number} (${o.position})`)],
  });
  revalidatePath("/admin/offers");
  redirect(`/admin/offers/${copy.id}`);
}
