"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, startSession, endSession, requireAdmin, loginConfigured } from "@/lib/auth";
import { projects, team, enquiries } from "@/lib/store";
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
  const category = String(formData.get("category") || "");
  const description = String(formData.get("description") || "").trim();
  const link = String(formData.get("link") || "").trim();
  const published = formData.get("published") === "on";
  const sort = Number(formData.get("sort") || 0) || 0;
  let slug = slugify(String(formData.get("slug") || "") || title);
  let images = [];
  try {
    images = JSON.parse(String(formData.get("images") || "[]"));
  } catch {}

  if (!title) return { error: "Please enter a project title." };
  if (!CATEGORIES.some((c) => c.id === category)) return { error: "Please choose a category." };
  if (!images.length) return { error: "Please add at least one image (the first one is the cover)." };
  if (link && !/^https?:\/\/\S+$/i.test(link)) return { error: "The project link must start with http:// or https://" };
  if (!slug) return { error: "Please enter a web address for the project." };

  const clash = await projects.get("slug", slug);
  if (clash && clash.id !== id) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const row = {
    title,
    slug,
    category,
    description,
    link,
    published,
    sort,
    images: images.map((im) => ({ src: String(im.src), w: Number(im.w) || 1600, h: Number(im.h) || 900, alt: String(im.alt || title) })),
  };
  try {
    if (id) await projects.update(id, row);
    else await projects.insert(row);
  } catch (e) {
    console.error(e);
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
