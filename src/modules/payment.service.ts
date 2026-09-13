import { randomInt } from "crypto";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { notifyEkonzoPayment } from "@/lib/ekonzo";
import { composePersonName, normalizeNamePart } from "@/lib/person-name";
import { oauthCredentials, usdCdfRate as configUsdCdfRate } from "@/lib/config";

/** Taux USD→CDF (override via USD_CDF_RATE). */
export function usdCdfRate() {
  return configUsdCdfRate();
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

export function defaultOpeningBalance(currency: "CDF" | "USD") {
  return currency === "USD" ? 100_000_000 : 100_000_000_000;
}

export async function createCustomer(input: {
  email: string;
  password?: string;
  passwordHash?: string;
  nom: string;
  postnom?: string;
  prenom: string;
  accountName?: string;
  currency?: "CDF" | "USD";
  balance?: number;
  docType?: string;
  docNumber?: string;
  dateOfBirth?: string;
  address?: string;
}) {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("E-mail invalide");

  let passwordHash = input.passwordHash;
  if (!passwordHash) {
    if (!input.password || input.password.length < 8) {
      throw new Error("Mot de passe : 8 caractères minimum");
    }
    passwordHash = await hash(input.password, 12);
  }

  const nom = normalizeNamePart(input.nom);
  const postnom = normalizeNamePart(input.postnom ?? "");
  const prenom = normalizeNamePart(input.prenom);
  if (!nom) throw new Error("Nom requis");
  if (!prenom) throw new Error("Prénom requis");
  const fullName = composePersonName({ nom, postnom, prenom });

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) throw new Error("E-mail déjà utilisé");

  const currency = input.currency ?? "CDF";
  const accountNumber = await generateAccountNumber();

  return prisma.customer.create({
    data: {
      email,
      passwordHash,
      fullName,
      nom,
      postnom,
      prenom,
      accountNumber,
      accountName: (input.accountName ?? fullName).trim(),
      currency,
      balance: input.balance ?? defaultOpeningBalance(currency),
      docType: input.docType || null,
      docNumber: input.docNumber || null,
      dateOfBirth: input.dateOfBirth || null,
      address: input.address || null,
    },
  });
}

export async function deleteCustomer(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    select: { id: true, fullName: true, email: true },
  });
  if (!customer) throw new Error("Client introuvable");

  await prisma.customer.delete({ where: { id } });
  return customer;
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
        clientId: oauthCredentials().clientId,
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
