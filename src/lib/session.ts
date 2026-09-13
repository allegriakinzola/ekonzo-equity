import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { requireEnv } from "@/lib/env";

const COOKIE = "equity_staff_session";
const CUSTOMER_COOKIE = "equity_customer_session";
const TTL_MS = 1000 * 60 * 60 * 12;

function secret() {
  return requireEnv("SESSION_SECRET");
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

async function readSignedCookie(name: string): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(name)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [id, expStr, sig] = parts;
  const payload = `${id}.${expStr}`;
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  if (Number(expStr) < Date.now()) return null;
  return id;
}

export async function getStaffSessionId(): Promise<string | null> {
  return readSignedCookie(COOKIE);
}

export async function setCustomerSession(customerId: string) {
  const exp = Date.now() + TTL_MS;
  const payload = `${customerId}.${exp}`;
  const value = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function clearCustomerSession() {
  const jar = await cookies();
  jar.delete(CUSTOMER_COOKIE);
}

export async function getCustomerSessionId(): Promise<string | null> {
  return readSignedCookie(CUSTOMER_COOKIE);
}
