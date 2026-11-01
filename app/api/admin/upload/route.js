import { isAdmin } from "@/lib/auth";
import { saveUpload } from "@/lib/store";

// Image upload for the admin. The browser shrinks photos before sending (see components/admin/ImageUploader.js).
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX = 4 * 1024 * 1024; // Vercel limits requests to about 4.5 MB

export async function POST(req) {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") return Response.json({ error: "No file received." }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return Response.json({ error: "Please upload a JPG, PNG or WebP image." }, { status: 400 });
  if (file.size > MAX) return Response.json({ error: "Image is too large (max 4 MB after resizing)." }, { status: 400 });
  try {
    const url = await saveUpload(Buffer.from(await file.arrayBuffer()), file.name || "image.jpg", file.type);
    return Response.json({ url });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Upload failed. Is the database connected?" }, { status: 500 });
  }
}
