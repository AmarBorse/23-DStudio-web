import { enquiries } from "@/lib/store";

// Contact form submissions → saved for the admin "Enquiries" box.
const recent = new Map(); // simple flood protection per visitor (best effort)

export async function POST(req) {
  let data;
  try {
    data = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  // Hidden "website" field: real visitors leave it empty, spam bots fill it in
  if (data.website) return Response.json({ ok: true });

  const name = String(data.name || "").trim().slice(0, 120);
  const email = String(data.email || "").trim().slice(0, 200);
  const phone = String(data.phone || "").trim().slice(0, 40);
  const message = String(data.message || "").trim().slice(0, 5000);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) {
    return Response.json({ error: "Please fill in your name, a valid email and your message." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const times = (recent.get(ip) || []).filter((t) => now - t < 10 * 60e3);
  if (times.length >= 5) return Response.json({ error: "Too many messages — please try again a little later." }, { status: 429 });
  recent.set(ip, [...times, now]);

  try {
    await enquiries.insert({ name, email, phone, message, read: false });
    return Response.json({ ok: true });
  } catch (e) {
    console.error("Saving enquiry failed:", e);
    return Response.json({ error: "Sorry, your message could not be sent." }, { status: 500 });
  }
}
