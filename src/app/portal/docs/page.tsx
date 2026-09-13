import { PageIntro } from "@/components/ui/PageIntro";

function env(name: string, fallback: string) {
  return (process.env[name] ?? fallback).replace(/\/$/, "");
}

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-[var(--equity-black)] p-4 text-[12px] leading-relaxed text-white/90">
      <code>{children}</code>
    </pre>
  );
}

function Inline({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-[var(--muted)] px-1.5 py-0.5 font-mono text-[12px] text-[var(--equity-black)]">
      {children}
    </code>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="eq-panel scroll-mt-24 space-y-4">
      <h2 className="text-lg font-extrabold tracking-tight text-[var(--equity-black)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function PortalDocsPage() {
  // Public ekonzo API by default; override via EKONZO_API_URL.
  const base = env("EKONZO_API_URL", "https://www.ekonzo.site");
  const code = env("EKONZO_BANK_CODE", "BANK_001").toUpperCase();
  const self = env("NEXT_PUBLIC_APP_URL", "http://localhost:3001");

  const sessionsUrl = `${base}/api/v1/banks/${code}/payments/sessions`;
  const notifyUrl = `${base}/api/v1/banks/${code}/payments/notify`;
  const ekonzoCallback = `${base}/profile/bank/callback`;

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Intégration"
        title="Documentation ekonzo"
        description="Comment Equity BCDC expose OAuth et consomme les API ekonzo pour la liaison de compte et le paiement des titres."
      />

      <nav className="eq-panel-muted flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
        {[
          ["#roles", "Rôles"],
          ["#oauth", "OAuth (à exposer)"],
          ["#paiement", "Paiement (API ekonzo)"],
          ["#env", "Variables .env"],
          ["#fichiers", "Fichiers clés"],
          ["#erreurs", "Erreurs fréquentes"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="text-[var(--equity-red)] underline-offset-4 hover:underline"
          >
            {label}
          </a>
        ))}
      </nav>

      <Section id="roles" title="1. Qui fait quoi ?">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-4">
            <p className="eq-eyebrow">ekonzo</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-[var(--equity-gray)]">
              <li>Émissions, souscriptions, investisseurs</li>
              <li>Crée la session de paiement</li>
              <li>
                Confirme le paiement après <Inline>notify</Inline>
              </li>
              <li>Appelle Equity : authorize → token → userinfo</li>
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-4">
            <p className="eq-eyebrow">Equity (cette app)</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-[var(--equity-gray)]">
              <li>Clients internet banking + soldes</li>
              <li>IdP OAuth (login, code, token, profil)</li>
              <li>
                UI de paiement <Inline>/payments/pay</Inline>
              </li>
              <li>Appelle ekonzo : sessions + notify</li>
            </ul>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-[var(--equity-gray)]">
          Les URLs enregistrées chez ekonzo pour cette banque doivent pointer
          vers <Inline>{self}</Inline> (pas localhost en production).
        </p>
      </Section>

      <Section id="oauth" title="2. Ce qu’Equity expose (OAuth — ekonzo appelle)">
        <p className="text-sm leading-relaxed text-[var(--equity-gray)]">
          ekonzo redirige l’investisseur vers Equity. Après login, Equity
          renvoie un <Inline>code</Inline> à usage unique. ekonzo l’échange
          ensuite côté serveur (avec le <Inline>client_secret</Inline>) contre
          un <Inline>access_token</Inline>, puis lit le profil compte.
        </p>

        <h3 className="text-sm font-bold text-[var(--equity-black)]">
          Étape A — Authorize (navigateur)
        </h3>
        <Code>{`GET ${self}/oauth/authorize
  ?response_type=code
  &client_id=ekz_…
  &redirect_uri=${ekonzoCallback}
  &state=…`}</Code>
        <p className="text-sm text-[var(--equity-gray)]">
          Après authentification client, Equity redirige :
        </p>
        <Code>{`{redirect_uri}?code=ABC123&state=…`}</Code>

        <h3 className="text-sm font-bold text-[var(--equity-black)]">
          Étape B — Token (serveur ekonzo → Equity)
        </h3>
        <Code>{`POST ${self}/api/oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "ABC123",
  "redirect_uri": "${ekonzoCallback}",
  "client_id": "ekz_…",
  "client_secret": "…"
}

→ {
  "access_token": "…",
  "token_type": "Bearer",
  "expires_in": 1800
}`}</Code>

        <h3 className="text-sm font-bold text-[var(--equity-black)]">
          Étape C — Userinfo (serveur ekonzo → Equity)
        </h3>
        <Code>{`GET ${self}/api/oauth/userinfo
Authorization: Bearer {access_token}

→ {
  "bankCustomerId": "clx…",
  "email": "jean@email.cd",
  "nom": "Mbala",
  "postnom": "Kabasele",
  "prenom": "Jean",
  "fullName": "Mbala Kabasele Jean",
  "accountNumber": "000129876543210",
  "accountName": "Mbala Kabasele Jean",
  "currency": "CDF"
}`}</Code>
        <p className="text-sm text-[var(--equity-gray)]">
          Ces champs sont obligatoires pour que ekonzo crée le{" "}
          <Inline>BankLink</Inline>.
        </p>
      </Section>

      <Section id="paiement" title="3. Ce qu’Equity appelle (API paiement ekonzo)">
        <p className="text-sm leading-relaxed text-[var(--equity-gray)]">
          ekonzo crée une session et envoie l’investisseur sur{" "}
          <Inline>{`${self}/payments/pay?token=…&client_id=…`}</Inline>. Equity
          lit la session, débite le compte (ou MoMo), puis notifie ekonzo.
        </p>

        <h3 className="text-sm font-bold text-[var(--equity-black)]">
          3.1 Lire la session — GET sessions
        </h3>
        <p className="text-sm text-[var(--equity-gray)]">
          Appelé côté serveur Equity (<Inline>src/lib/ekonzo.ts</Inline>). Le
          secret ne doit jamais passer par le navigateur.
        </p>
        <Code>{`GET ${sessionsUrl}?token={token_clair}

Headers:
  X-Client-Id: {EKONZO_CLIENT_ID}
  X-Client-Secret: {EKONZO_CLIENT_SECRET}

→ {
  "token": "…",
  "status": "PENDING",
  "amount": 100,
  "currency": "USD",
  "productLabel": "Bon du Trésor…",
  "instrumentKind": "BOND",
  "accountNumber": "000129876543210",
  "accountName": "Mbala Kabasele Jean",
  "returnUrl": "${base}/…",
  "expiresAt": "2026-09-13T…",
  "bank": { "code": "${code}", "shortName": "…", "name": "…" }
}`}</Code>

        <h3 className="text-sm font-bold text-[var(--equity-black)]">
          3.2 Confirmer le paiement — POST notify
        </h3>
        <p className="text-sm text-[var(--equity-gray)]">
          À appeler{" "}
          <strong className="font-semibold text-[var(--equity-black)]">
            après
          </strong>{" "}
          un débit réussi uniquement. ekonzo passe alors la souscription en{" "}
          <Inline>PAYMENT_CONFIRMED</Inline>.
        </p>
        <Code>{`POST ${notifyUrl}
Content-Type: application/json

{
  "client_id": "{EKONZO_CLIENT_ID}",
  "client_secret": "{EKONZO_CLIENT_SECRET}",
  "token": "{token_clair}",
  "notify_ref": "EQ-20260913-001",
  "channel": "BANK_TRANSFER"
}

→ {
  "status": "COMPLETED",
  "alreadyProcessed": false,
  "subscriptionId": "…",
  "notifyRef": "EQ-20260913-001",
  "returnUrl": "${base}/…"
}`}</Code>
        <p className="text-sm text-[var(--equity-gray)]">
          <Inline>channel</Inline> : <Inline>BANK_TRANSFER</Inline> ou{" "}
          <Inline>MOBILE_MONEY</Inline>. Ensuite rediriger l’investisseur vers{" "}
          <Inline>returnUrl</Inline>.
        </p>
      </Section>

      <Section id="env" title="4. Variables d’environnement (Equity)">
        <p className="text-sm text-[var(--equity-gray)]">
          Doivent correspondre exactement au <Inline>PartnerBank</Inline>{" "}
          enregistré sur ekonzo (code + clés OAuth).
        </p>
        <Code>{`NEXT_PUBLIC_APP_URL=${self}
EKONZO_API_URL=${base}
EKONZO_BANK_CODE=${code}
EKONZO_CLIENT_ID=ekz_…
EKONZO_CLIENT_SECRET=…
DATABASE_URL=…
SESSION_SECRET=…`}</Code>
        <ul className="list-disc space-y-1.5 pl-4 text-sm text-[var(--equity-gray)]">
          <li>
            <Inline>EKONZO_BANK_CODE</Inline> = code banque ekonzo (ex.{" "}
            <Inline>BANK_001</Inline>), pas un libellé libre.
          </li>
          <li>
            <Inline>CLIENT_ID</Inline> / <Inline>SECRET</Inline> = couple généré
            par ekonzo pour cette banque uniquement.
          </li>
          <li>
            Le <Inline>client_secret</Inline> reste serveur-only (jamais dans
            une URL ou une page publique).
          </li>
        </ul>
      </Section>

      <Section id="fichiers" title="5. Où c’est implémenté dans ce repo">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] font-bold uppercase tracking-wider text-[var(--equity-gray)]">
                <th className="pb-2 pr-3">Rôle</th>
                <th className="pb-2">Fichier</th>
              </tr>
            </thead>
            <tbody className="text-[var(--equity-gray)]">
              {[
                ["Client HTTP ekonzo (sessions + notify)", "src/lib/ekonzo.ts"],
                ["Config / credentials", "src/lib/config.ts"],
                [
                  "OAuth métier (code, token, userinfo)",
                  "src/modules/oauth.service.ts",
                ],
                ["POST /api/oauth/token", "src/app/api/oauth/token/route.ts"],
                [
                  "GET /api/oauth/userinfo",
                  "src/app/api/oauth/userinfo/route.ts",
                ],
                ["UI authorize", "src/app/oauth/authorize/"],
                ["UI paiement", "src/app/payments/pay/"],
                ["Débit compte / MoMo", "src/modules/payment.service.ts"],
              ].map(([role, file]) => (
                <tr key={file} className="border-b border-[var(--border)]/70">
                  <td className="py-2.5 pr-3">{role}</td>
                  <td className="py-2.5 font-mono text-[12px] text-[var(--equity-black)]">
                    {file}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="erreurs" title="6. Erreurs fréquentes">
        <ul className="space-y-3 text-sm text-[var(--equity-gray)]">
          <li>
            <strong className="text-[var(--equity-black)]">
              Session introuvable
            </strong>
            <br />
            Token expiré / déjà consommé, ou{" "}
            <Inline>EKONZO_BANK_CODE</Inline> différent du code banque de la
            session. Relancer le paiement depuis ekonzo.
          </li>
          <li>
            <strong className="text-[var(--equity-black)]">
              Non autorisé (401)
            </strong>
            <br />
            <Inline>EKONZO_CLIENT_ID</Inline> /{" "}
            <Inline>EKONZO_CLIENT_SECRET</Inline> ne correspondent pas aux clés
            ekonzo (régénération côté ekonzo → mettre à jour Vercel).
          </li>
          <li>
            <strong className="text-[var(--equity-black)]">
              Redirect vers localhost
            </strong>
            <br />
            Les URLs <Inline>authorizeUrl</Inline> / paiement dans ekonzo
            pointent encore vers <Inline>localhost:3001</Inline>. Les mettre à
            jour vers <Inline>{self}</Inline>.
          </li>
          <li>
            <strong className="text-[var(--equity-black)]">
              client_id invalide à l’authorize
            </strong>
            <br />
            Le <Inline>client_id</Inline> de la query doit égaler{" "}
            <Inline>EKONZO_CLIENT_ID</Inline> côté Equity.
          </li>
        </ul>
      </Section>

      <section className="eq-panel-muted space-y-2">
        <p className="eq-eyebrow">Rappel sécurité</p>
        <p className="text-sm leading-relaxed text-[var(--equity-gray)]">
          <Inline>client_id</Inline> peut apparaître dans les redirections
          navigateur. <Inline>client_secret</Inline>, échange de{" "}
          <Inline>code</Inline>, lecture <Inline>sessions</Inline> et{" "}
          <Inline>notify</Inline> : uniquement serveur à serveur.
        </p>
      </section>
    </div>
  );
}
