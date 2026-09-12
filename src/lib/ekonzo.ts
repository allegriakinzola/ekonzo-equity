import { ekonzoApiUrl, bankCode, oauthCredentials } from "./config";

export type EkonzoPaymentSession = {
  token: string;
  status: string;
  amount: number;
  currency: string;
  productLabel: string;
  instrumentKind: string;
  accountNumber: string;
  accountName: string;
  returnUrl: string;
  expiresAt: string;
  bank: { code: string; shortName: string; name: string };
};

/** Récupère le détail d'une session de paiement ekonzo (API v1). */
export async function fetchEkonzoPaymentSession(
  token: string,
): Promise<EkonzoPaymentSession> {
  const { clientId, clientSecret } = oauthCredentials();
  const url = new URL(
    `${ekonzoApiUrl()}/api/v1/banks/${bankCode()}/payments/sessions`,
  );
  url.searchParams.set("token", token);

  const res = await fetch(url.toString(), {
    headers: {
      "X-Client-Id": clientId,
      "X-Client-Secret": clientSecret,
    },
    cache: "no-store",
  });
  const json = (await res.json()) as EkonzoPaymentSession & { error?: string };
  if (!res.ok) {
    throw new Error(json.error || "Session ekonzo introuvable");
  }
  return json;
}

export async function notifyEkonzoPayment(input: {
  token: string;
  notifyRef?: string;
  channel?: "BANK_TRANSFER" | "MOBILE_MONEY";
}) {
  const { clientId, clientSecret } = oauthCredentials();
  const res = await fetch(
    `${ekonzoApiUrl()}/api/v1/banks/${bankCode()}/payments/notify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        token: input.token,
        notify_ref: input.notifyRef,
        channel: input.channel,
      }),
    },
  );
  const json = (await res.json()) as {
    status?: string;
    alreadyProcessed?: boolean;
    subscriptionId?: string;
    notifyRef?: string;
    returnUrl?: string;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(json.error || "Notification ekonzo refusée");
  }
  return json;
}
