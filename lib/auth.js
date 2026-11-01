import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/*
 * Admin login: one password for the studio.
 *   ADMIN_PASSWORD   the password used on /admin/login
 *   SESSION_SECRET   any long random text (signs the login cookie)
 * Set both in Vercel → Settings → Environment Variables (and in .env.local on your computer).
 */
const COOKIE = "admin_session";
const DAYS = 7;

const secret = () => process.env.SESSION_SECRET || (process.env.NODE_ENV !== "production" ? "dev-only-secret" : "");
export const loginConfigured = () => Boolean(process.env.ADMIN_PASSWORD && secret());

function sign(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}
function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function checkPassword(input) {
  return loginConfigured() && safeEqual(input, process.env.ADMIN_PASSWORD);
}

export async function startSession() {
  const expires = Date.now() + DAYS * 864e5;
  const value = `${expires}.${sign(String(expires))}`;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!loginConfigured()) return false;
  const value = (await cookies()).get(COOKIE)?.value || "";
  const [expires, sig] = value.split(".");
  return Boolean(expires && sig && Number(expires) > Date.now() && safeEqual(sig, sign(expires)));
}

// Use at the top of every admin page and action
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
