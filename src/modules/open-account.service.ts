import { createHash, randomInt } from "crypto";
import { hash as bcryptHash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mailer";
import { extractDocumentFromBuffer } from "@/modules/kyc/kyc.service";
import {
  createCustomer,
  defaultOpeningBalance,
} from "@/modules/payment.service";
import { composePersonName, normalizeNamePart } from "@/lib/person-name";
import type { KycDocType } from "@/modules/kyc/kyc.types";

const OTP_TTL_MS = 5 * 60 * 1000;
const AFTER_OTP_TTL_MS = 20 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashOtp(otp: string) {
  return createHash("sha256").update(otp).digest("hex");
}

function generateOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

async function getPending(email: string) {
  return prisma.pendingCustomer.findUnique({ where: { email } });
}

export async function startOpenAccount(input: {
  email: string;
  password: string;
  confirmPassword: string;
  currency: "CDF" | "USD";
}) {
  const email = normalizeEmail(input.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("E-mail invalide");
  }
  if (input.password.length < 8) {
    throw new Error("Le mot de passe doit contenir au moins 8 caractères");
  }
  if (input.password !== input.confirmPassword) {
    throw new Error("Les mots de passe ne correspondent pas");
  }

  const existing = await prisma.customer.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    throw new Error("Un compte existe déjà avec cet e-mail. Connectez-vous.");
  }

  const otp = generateOtp();
  const passwordHash = await bcryptHash(input.password, 12);

  await prisma.pendingCustomer.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      currency: input.currency,
      otpHash: hashOtp(otp),
      attempts: 0,
      otpVerifiedAt: null,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
    update: {
      passwordHash,
      currency: input.currency,
      otpHash: hashOtp(otp),
      attempts: 0,
      otpVerifiedAt: null,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  await sendOtpEmail(email, otp);
  return { email };
}

export async function resendOpenAccountOtp(emailRaw: string) {
  const email = normalizeEmail(emailRaw);
  const pending = await getPending(email);
  if (!pending) throw new Error("Aucune inscription en cours pour cet e-mail");

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) throw new Error("Un compte existe déjà avec cet e-mail");

  const otp = generateOtp();
  await prisma.pendingCustomer.update({
    where: { email },
    data: {
      otpHash: hashOtp(otp),
      attempts: 0,
      otpVerifiedAt: null,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  await sendOtpEmail(email, otp);
  return { email };
}

export async function verifyOpenAccountOtp(emailRaw: string, otpRaw: string) {
  const email = normalizeEmail(emailRaw);
  const otp = otpRaw.trim();
  if (!/^\d{6}$/.test(otp)) throw new Error("Code à 6 chiffres requis");

  const pending = await getPending(email);
  if (!pending) throw new Error("Aucune inscription en cours");
  if (pending.expiresAt.getTime() < Date.now()) {
    throw new Error("Code expiré. Renvoyez un nouveau code.");
  }
  if (pending.attempts >= MAX_ATTEMPTS) {
    throw new Error("Trop de tentatives. Renvoyez un nouveau code.");
  }

  if (pending.otpHash !== hashOtp(otp)) {
    await prisma.pendingCustomer.update({
      where: { email },
      data: { attempts: { increment: 1 } },
    });
    throw new Error("Code invalide");
  }

  await prisma.pendingCustomer.update({
    where: { email },
    data: {
      otpVerifiedAt: new Date(),
      expiresAt: new Date(Date.now() + AFTER_OTP_TTL_MS),
    },
  });

  return { email, currency: pending.currency as "CDF" | "USD" };
}

async function requireVerifiedPending(emailRaw: string) {
  const email = normalizeEmail(emailRaw);
  const pending = await getPending(email);
  if (!pending) throw new Error("Aucune inscription en cours");
  if (!pending.otpVerifiedAt) {
    throw new Error("Validez d'abord le code reçu par e-mail");
  }
  if (pending.expiresAt.getTime() < Date.now()) {
    throw new Error("Session expirée. Recommencez l'ouverture de compte.");
  }
  return pending;
}

export async function extractOpenAccountDocument(input: {
  email: string;
  buffer: Buffer;
}) {
  await requireVerifiedPending(input.email);
  return extractDocumentFromBuffer(input.buffer);
}

export async function completeOpenAccount(input: {
  email: string;
  docType: KycDocType;
  nom: string;
  postnom?: string;
  prenom: string;
  dateOfBirth?: string;
  docNumber?: string;
  address?: string;
}) {
  const pending = await requireVerifiedPending(input.email);
  const nom = normalizeNamePart(input.nom);
  const prenom = normalizeNamePart(input.prenom);
  const postnom = normalizeNamePart(input.postnom ?? "");
  if (!nom) throw new Error("Nom requis — vérifiez les informations du document");
  if (!prenom) {
    throw new Error("Prénom requis — vérifiez les informations du document");
  }

  const currency = pending.currency as "CDF" | "USD";
  const customer = await createCustomer({
    email: pending.email,
    passwordHash: pending.passwordHash,
    nom,
    postnom,
    prenom,
    currency,
    balance: defaultOpeningBalance(currency),
    docType: input.docType,
    docNumber: input.docNumber,
    dateOfBirth: input.dateOfBirth,
    address: input.address,
  });

  await prisma.pendingCustomer.delete({ where: { email: pending.email } });

  return {
    id: customer.id,
    email: customer.email,
    fullName: composePersonName({ nom, postnom, prenom }),
    accountNumber: customer.accountNumber,
    currency,
    balance: defaultOpeningBalance(currency),
  };
}
