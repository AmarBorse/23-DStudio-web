// Shrinks a photo in the browser (max 2400px, JPEG) and uploads it. Returns { src, w, h }.
const MAX_SIDE = 2400;

async function shrink(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
  const keepPng = file.type === "image/png" && scale === 1;
  const blob = await new Promise((r) => canvas.toBlob(r, keepPng ? "image/png" : "image/jpeg", 0.86));
  const name = file.name.replace(/\.[^.]+$/, "") + (keepPng ? ".png" : ".jpg");
  return { blob, name, w, h };
}

export async function uploadImage(file) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  const { blob, name, w, h } = await shrink(file);
  const body = new FormData();
  body.append("file", blob, name);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed.");
  return { src: data.url, w, h };
}
