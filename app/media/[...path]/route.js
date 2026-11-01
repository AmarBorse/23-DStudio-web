import { promises as fs } from "fs";
import path from "path";
import { backend, UPLOAD_DIR } from "@/lib/store";

// Serves images uploaded through the admin when running without Supabase (on your computer).
const TYPES = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

export async function GET(_req, { params }) {
  if (backend !== "file") return new Response("Not found", { status: 404 });
  const { path: parts } = await params;
  const name = path.basename(parts.join("/"));
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(data, {
      headers: { "Content-Type": TYPES[path.extname(name).toLowerCase()] || "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
