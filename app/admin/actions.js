"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, startSession, endSession, requireAdmin, loginConfigured } from "@/lib/auth";
import { projects, team, enquiries, quotations } from "@/lib/store";
import { nextQuoteNumber, todayISO, addDays, changedFields, historyEntry, statusLabel } from "@/lib/quote";
import { QUOTE_DEFAULTS } from "@/lib/company";
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
  const cleanImage = (im) => (im?.src ? { src: String(im.src), w: Number(im.w) || 1600, h: Number(im.h) || 900, alt: String(im.alt || title) } : null);
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
