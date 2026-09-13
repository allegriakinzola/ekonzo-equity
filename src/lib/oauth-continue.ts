/** Paramètres OAuth à conserver entre connexion et ouverture de compte. */
export type OauthContinue = {
  clientId: string;
  redirectUri: string;
  state: string;
};

function firstString(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function parseOauthContinue(
  sp: Record<string, string | string[] | undefined> | URLSearchParams,
): OauthContinue | null {
  const get =
    sp instanceof URLSearchParams
      ? (key: string) => sp.get(key) ?? ""
      : (key: string) => firstString(sp[key]);

  const clientId = get("client_id").trim();
  const redirectUri = get("redirect_uri").trim();
  const state = get("state").trim();
  const responseType = (get("response_type") || "code").trim();

  if (!clientId || !redirectUri || !state || responseType !== "code") {
    return null;
  }
  try {
    const url = new URL(redirectUri);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  } catch {
    return null;
  }

  return { clientId, redirectUri, state };
}

export function oauthQuery(oauth: OauthContinue) {
  return new URLSearchParams({
    response_type: "code",
    client_id: oauth.clientId,
    redirect_uri: oauth.redirectUri,
    state: oauth.state,
  });
}

export function oauthAuthorizePath(oauth: OauthContinue) {
  return `/oauth/authorize?${oauthQuery(oauth)}`;
}

export function openAccountFromOauthPath(oauth: OauthContinue) {
  return `/open-account?${oauthQuery(oauth)}`;
}
