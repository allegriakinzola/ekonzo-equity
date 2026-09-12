import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { oauthCredentials } from "@/lib/config";
import { hashToken, newRawToken } from "@/lib/session";

const CODE_TTL_MS = 1000 * 60 * 5;
const TOKEN_TTL_MS = 1000 * 60 * 30;

export async function authenticateCustomer(email: string, password: string) {
  const customer = await prisma.customer.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!customer || !customer.isActive) {
    throw new Error("Identifiants incorrects");
  }
  const ok = await compare(password, customer.passwordHash);
  if (!ok) throw new Error("Identifiants incorrects");
  return customer;
}

export async function issueAuthorizationCode(input: {
  customerId: string;
  clientId: string;
  redirectUri: string;
  state: string;
}) {
  const { clientId } = oauthCredentials();
  if (input.clientId !== clientId) {
    throw new Error("client_id invalide");
  }

  const raw = newRawToken(24);
  await prisma.authCode.create({
    data: {
      codeHash: hashToken(raw),
      customerId: input.customerId,
      clientId: input.clientId,
      redirectUri: input.redirectUri,
      state: input.state,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });
  return raw;
}

export async function exchangeAuthorizationCode(input: {
  grant_type: string;
  code: string;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
}) {
  if (input.grant_type !== "authorization_code") {
    throw new Error("grant_type non supporté");
  }
  const { clientId, clientSecret } = oauthCredentials();
  if (
    input.client_id !== clientId ||
    input.client_secret !== clientSecret
  ) {
    throw new Error("Identifiants client invalides");
  }

  const codeHash = hashToken(input.code);
  const row = await prisma.authCode.findUnique({
    where: { codeHash },
    include: { customer: true },
  });
  if (!row || row.usedAt) throw new Error("Code invalide ou déjà utilisé");
  if (row.expiresAt.getTime() < Date.now()) throw new Error("Code expiré");
  if (row.redirectUri !== input.redirect_uri) {
    throw new Error("redirect_uri ne correspond pas");
  }
  if (row.clientId !== input.client_id) throw new Error("client_id invalide");

  await prisma.authCode.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });

  const accessRaw = newRawToken(32);
  await prisma.accessToken.create({
    data: {
      tokenHash: hashToken(accessRaw),
      customerId: row.customerId,
      clientId: input.client_id,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return {
    access_token: accessRaw,
    token_type: "Bearer",
    expires_in: Math.floor(TOKEN_TTL_MS / 1000),
  };
}

export async function getUserinfo(accessToken: string) {
  const row = await prisma.accessToken.findUnique({
    where: { tokenHash: hashToken(accessToken) },
    include: { customer: true },
  });
  if (!row || row.revokedAt) throw new Error("Token invalide");
  if (row.expiresAt.getTime() < Date.now()) throw new Error("Token expiré");

  const c = row.customer;
  return {
    bankCustomerId: c.id,
    email: c.email,
    nom: c.nom,
    postnom: c.postnom,
    prenom: c.prenom,
    fullName: c.fullName,
    accountNumber: c.accountNumber,
    accountName: c.accountName,
    currency: c.currency,
  };
}
