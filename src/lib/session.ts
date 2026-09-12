import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "equity_staff_session";
const TTL_MS = 1000 * 60 * 60 * 12;

function secret() {
  return process.env.SESSION_SECRET ?? "equity-dev-session-secret-change-me";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function newRawToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export async function setStaffSession(staffId: string) {
  const exp = Date.now() + TTL_MS;
  const payload = `${staffId}.${exp}`;
  const value = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function clearStaffSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getStaffSessionId(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [staffId, expStr, sig] = parts;
  const payload = `${staffId}.${expStr}`;
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  if (Number(expStr) < Date.now()) return null;
  return staffId;
}
