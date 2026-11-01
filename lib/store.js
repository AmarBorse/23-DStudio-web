import "server-only";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { seedProjects, seedTeam } from "@/lib/seed";

/*
 * Data layer for projects, team members and enquiries.
 *
 * Live site: Supabase (database + image storage). Set these in Vercel → Settings → Environment Variables:
 *   SUPABASE_URL                 e.g. https://abcd1234.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY    Supabase → Project Settings → API → service_role key (keep secret, server only)
 * Without them (e.g. on your computer) everything is saved in the .data/ folder instead.
 */

const SB_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const backend = SB_URL && SB_KEY ? "supabase" : "file";
const BUCKET = "media";

/* ---------------- Supabase (REST, no extra packages) ---------------- */
async function sb(pathname, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${pathname}`, {
    method,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Database error (${res.status}): ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

/* ---------------- Local file (development) ---------------- */
const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

async function readDb() {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, "utf8"));
  } catch {
    const now = Date.now();
    const db = {
      projects: seedProjects.map((p, i) => ({ id: crypto.randomUUID(), created_at: new Date(now - i * 1000).toISOString(), ...p })),
      team: seedTeam.map((m) => ({ id: crypto.randomUUID(), created_at: new Date(now).toISOString(), ...m })),
      enquiries: [],
    };
    try {
      await writeDb(db);
    } catch {
      /* read-only file system (e.g. Vercel without a database): just use the seed data */
    }
    return db;
  }
}
async function writeDb(db) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, DB_FILE);
}

/* ---------------- shared helpers ---------------- */
const bySort = (a, b) => (a.sort ?? 0) - (b.sort ?? 0) || String(b.created_at).localeCompare(String(a.created_at));

function table(name) {
  return {
    async list(filter = {}) {
      if (backend === "supabase") {
        const q = Object.entries(filter).map(([k, v]) => `&${k}=eq.${encodeURIComponent(v)}`).join("");
        return sb(`${name}?select=*${q}&order=${name === "enquiries" ? "created_at.desc" : "sort.asc,created_at.desc"}`);
      }
      const rows = (await readDb())[name].filter((r) => Object.entries(filter).every(([k, v]) => String(r[k]) === String(v)));
      return name === "enquiries" ? rows.sort((a, b) => b.created_at.localeCompare(a.created_at)) : rows.sort(bySort);
    },
    async get(field, value) {
      if (backend === "supabase") return (await sb(`${name}?select=*&${field}=eq.${encodeURIComponent(value)}&limit=1`))[0] || null;
      return (await readDb())[name].find((r) => String(r[field]) === String(value)) || null;
    },
    async insert(row) {
      if (backend === "supabase") return (await sb(name, { method: "POST", body: row }))[0];
      const db = await readDb();
      const full = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...row };
      db[name].push(full);
      await writeDb(db);
      return full;
    },
    async update(id, patch) {
      if (backend === "supabase") return (await sb(`${name}?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: patch }))[0];
      const db = await readDb();
      const i = db[name].findIndex((r) => r.id === id);
      if (i === -1) throw new Error("Not found");
      db[name][i] = { ...db[name][i], ...patch };
      await writeDb(db);
      return db[name][i];
    },
    async remove(id) {
      if (backend === "supabase") return sb(`${name}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
      const db = await readDb();
      db[name] = db[name].filter((r) => r.id !== id);
      await writeDb(db);
    },
  };
}

export const projects = table("projects");
export const team = table("team");
export const enquiries = table("enquiries");

/* ---------------- images ---------------- */
export async function saveUpload(buffer, filename, contentType) {
  const ext = (path.extname(filename) || ".jpg").toLowerCase().replace(/[^.a-z0-9]/g, "");
  const name = `${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}${ext}`;
  if (backend === "supabase") {
    const res = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${name}`, {
      method: "POST",
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": contentType, "x-upsert": "false" },
      body: buffer,
    });
    if (!res.ok) throw new Error(`Upload failed (${res.status}): ${await res.text()}`);
    return `${SB_URL}/storage/v1/object/public/${BUCKET}/${name}`;
  }
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buffer);
  return `/media/${name}`;
}
