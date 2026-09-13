import { requireEnv, optionalEnv } from "@/lib/env";

export function appUrl() {
  return requireEnv("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");
}

export function ekonzoApiUrl() {
  return requireEnv("EKONZO_API_URL").replace(/\/$/, "");
}

export function bankCode() {
  return requireEnv("EKONZO_BANK_CODE").toUpperCase();
}

export function oauthCredentials() {
  return {
    clientId: requireEnv("EKONZO_CLIENT_ID"),
    clientSecret: requireEnv("EKONZO_CLIENT_SECRET"),
  };
}

/** Taux USD→CDF (optionnel ; défaut documenté côté métier si absent). */
export function usdCdfRate() {
  const raw = Number(optionalEnv("USD_CDF_RATE") ?? "2850");
  return Number.isFinite(raw) && raw > 0 ? raw : 2850;
}
