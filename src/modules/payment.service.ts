import { randomInt } from "crypto";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { notifyEkonzoPayment } from "@/lib/ekonzo";
import { composePersonName, normalizeNamePart } from "@/lib/person-name";

/** Taux USD→CDF (override via USD_CDF_RATE). */
export function usdCdfRate() {
  const raw = Number(process.env.USD_CDF_RATE ?? "2850");
  return Number.isFinite(raw) && raw > 0 ? raw : 2850;
}

/**
 * Convertit un montant de devise A vers devise B.
 * CDF ↔ USD via taux configurable ; même devise = identité.
 */
export function convertAmount(
  amount: number,
  from: "CDF" | "USD",
  to: "CDF" | "USD",
) {
  if (from === to) return amount;
  const rate = usdCdfRate();
  if (from === "USD" && to === "CDF") return amount * rate;
  return amount / rate;
}

/** N° compte Equity BCDC : agence 00012 + 11 chiffres uniques. */
export async function generateAccountNumber() {
  for (let attempt = 0; attempt < 12; attempt++) {
    const body = String(randomInt(0, 1e11)).padStart(11, "0");
    const accountNumber = `00012${body}`;
    const clash = await prisma.customer.findUnique({
      where: { accountNumber },
      select: { id: true },
    });
    if (!clash) return accountNumber;
  }
  throw new Error("Impossible de générer un numéro de compte unique");
}

export async function listCustomers() {
  return prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      fullName: true,
      nom: true,
      postnom: true,
      prenom: true,
      accountNumber: true,
      accountName: true,
      currency: true,
      balance: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function createCustomer(input: {
  email: string;
  password: string;
  nom: string;
  postnom?: string;
  prenom: string;
  accountName?: string;
  currency?: "CDF" | "USD";
  balance?: number;
}) {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("E-mail invalide");
  if (input.password.length < 8) {
    throw new Error("Mot de passe : 8 caractères minimum");
  }

  const { composePersonName, normalizeNamePart } = await import(
    "@/lib/person-name"
  );
  const nom = normalizeNamePart(input.nom);
  const postnom = normalizeNamePart(input.postnom ?? "");
  const prenom = normalizeNamePart(input.prenom);
  if (!nom) throw new Error("Nom requis");
  if (!prenom) throw new Error("Prénom requis");
  const fullName = composePersonName({ nom, postnom, prenom });

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) throw new Error("E-mail déjà utilisé");

  const accountNumber = await generateAccountNumber();

  return prisma.customer.create({
    data: {
      email,
      passwordHash: await hash(input.password, 12),
      fullName,
      nom,
      postnom,
      prenom,
      accountNumber,
      accountName: (input.accountName ?? fullName).trim(),
      currency: input.currency ?? "CDF",
      balance: input.balance ?? 10_000_000,
    },
  });
}

/** Débite le compte client (avec conversion devise si besoin) puis notifie ekonzo. */
export async function confirmPaymentFromAccount(input: {
  token: string;
  accountNumber: string;
  amount: number;
  currency: "CDF" | "USD";
  channel?: "BANK_TRANSFER" | "MOBILE_MONEY";
  momoPhone?: string;
}) {
  const channel = input.channel ?? "BANK_TRANSFER";
  const customer = await prisma.customer.findUnique({
    where: { accountNumber: input.accountNumber },
  });
  if (!customer || !customer.isActive) {
    throw new Error("Compte bancaire introuvable");
  }

  const accountCurrency = customer.currency as "CDF" | "USD";
  const debitAmount = convertAmount(
    input.amount,
    input.currency,
    accountCurrency,
  );

  if (Number(customer.balance) < debitAmount) {
    const needed = Math.ceil(debitAmount).toLocaleString("fr-CD");
    throw new Error(
      `Solde insuffisant (${needed} ${accountCurrency} requis après conversion)`,
    );
  }

  const notifyRef = `EQ-${Date.now().toString(36).toUpperCase()}`;

  await prisma.$transaction(async (tx) => {
    await tx.customer.update({
      where: { id: customer.id },
      data: { balance: { decrement: debitAmount } },
    });
    await tx.paymentIntent.upsert({
      where: { ekonzoToken: input.token },
      create: {
        ekonzoToken: input.token,
        clientId: process.env.EKONZO_CLIENT_ID ?? "",
        amount: input.amount,
        currency: input.currency,
        accountNumber: input.accountNumber,
        status: "PAID",
        notifyRef,
        paidAt: new Date(),
      },
      update: {
        status: "PAID",
        notifyRef,
        paidAt: new Date(),
      },
    });
  });

  const result = await notifyEkonzoPayment({
    token: input.token,
    notifyRef,
    channel,
  });

  return {
    ...result,
    notifyRef,
    channel,
    momoPhone: input.momoPhone,
    debitAmount,
    debitCurrency: accountCurrency,
    fxApplied: accountCurrency !== input.currency,
    usdCdfRate: usdCdfRate(),
  };
}
