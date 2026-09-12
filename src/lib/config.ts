export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001").replace(
    /\/$/,
    "",
  );
}

export function ekonzoApiUrl() {
  return (process.env.EKONZO_API_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function bankCode() {
  return (process.env.EKONZO_BANK_CODE ?? "EQUITY").toUpperCase();
}

export function oauthCredentials() {
  const clientId = process.env.EKONZO_CLIENT_ID?.trim();
  const clientSecret = process.env.EKONZO_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error(
      "EKONZO_CLIENT_ID et EKONZO_CLIENT_SECRET doivent être définis dans .env",
    );
  }
  return { clientId, clientSecret };
}
