import { AuthLayout } from "@/components/ui/AuthLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { AlertBox } from "@/components/ui/AlertBox";
import { OAuthLoginForm } from "./OAuthLoginForm";

export default async function AuthorizePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const clientId = String(sp.client_id ?? "");
  const redirectUri = String(sp.redirect_uri ?? "");
  const state = String(sp.state ?? "");
  const responseType = String(sp.response_type ?? "code");

  const missing =
    !clientId || !redirectUri || !state || responseType !== "code";

  return (
    <AuthLayout
      brandTitle="Equity BCDC"
      brandText="Autorisez ekonzo à lier votre compte internet banking pour souscrire aux titres publics."
    >
      <PageIntro
        eyebrow="Internet banking"
        title="Connexion"
        description="Identifiez-vous pour autoriser la liaison de votre compte Equity BCDC."
      />

      <div className="eq-reveal eq-reveal-delay mt-8">
        {missing ? (
          <AlertBox>
            Paramètres OAuth incomplets. Relancez la liaison depuis ekonzo.
          </AlertBox>
        ) : (
          <OAuthLoginForm
            clientId={clientId}
            redirectUri={redirectUri}
            state={state}
          />
        )}
      </div>
    </AuthLayout>
  );
}
