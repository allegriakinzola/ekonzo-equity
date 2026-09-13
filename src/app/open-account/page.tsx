import Link from "next/link";
import { AuthLayout } from "@/components/ui/AuthLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import {
  oauthAuthorizePath,
  parseOauthContinue,
} from "@/lib/oauth-continue";
import { OpenAccountFlow } from "./OpenAccountFlow";

export default async function OpenAccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const oauth = parseOauthContinue(await searchParams);
  const loginHref = oauth ? oauthAuthorizePath(oauth) : "/account/login";

  return (
    <AuthLayout
      wide
      brandTitle="Ouvrir un compte"
      brandText={
        oauth
          ? "Créez votre compte internet banking Equity BCDC, puis autorisez ekonzo à le lier pour souscrire aux titres publics."
          : "Créez votre compte internet banking Equity BCDC : e-mail, code de vérification, puis pièce d'identité."
      }
    >
      <PageIntro
        eyebrow="Internet banking"
        title="Nouveau compte"
        description={
          oauth
            ? "Trois étapes : identifiants, code reçu par e-mail, puis photo de votre pièce d'identité. Ensuite, ekonzo sera autorisé."
            : "Trois étapes : identifiants, code reçu par e-mail, puis photo de votre carte d'identité ou passeport."
        }
      />
      <div className="mt-8">
        <OpenAccountFlow oauth={oauth} />
      </div>
      <p className="mt-8 text-center text-xs text-[var(--equity-gray)]">
        Déjà un compte ?{" "}
        <Link href={loginHref} className="eq-link-quiet inline">
          Se connecter
        </Link>
        <span className="mx-2">·</span>
        <Link href="/" className="eq-link-quiet inline">
          Accueil
        </Link>
      </p>
    </AuthLayout>
  );
}
