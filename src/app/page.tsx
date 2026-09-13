import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { PageIntro } from "@/components/ui/PageIntro";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <div className="eq-reveal mb-8">
        <BrandLogo size="lg" priority />
        <div className="equity-heritage-bar mt-4" />
      </div>

      <PageIntro
        eyebrow="Banque commerciale · RDC"
        title="Portail partenaire ekonzo"
        description="Espace Equity BCDC pour l'internet banking, la liaison de compte investisseur et le règlement des Bons & Obligations du Trésor."
        className="eq-reveal eq-reveal-delay max-w-xl"
      />

      <div className="eq-reveal eq-reveal-delay-2 mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/open-account"
          className="eq-panel group transition hover:-translate-y-0.5 hover:border-[var(--equity-red)]/30"
        >
          <p className="eq-eyebrow">Clients</p>
          <p className="eq-section-title mt-2">Ouvrir un compte</p>
          <p className="eq-section-lead">
            E-mail, code OTP, puis pièce d&apos;identité
          </p>
        </Link>
        <Link
          href="/login"
          className="eq-panel group transition hover:-translate-y-0.5 hover:border-[var(--equity-red)]/30"
        >
          <p className="eq-eyebrow">Opérations</p>
          <p className="eq-section-title mt-2">Espace agents</p>
          <p className="eq-section-lead">
            Gérer les clients internet banking
          </p>
        </Link>
        <Link
          href="/account/login"
          className="eq-panel group transition hover:-translate-y-0.5 hover:border-[var(--equity-red)]/30"
        >
          <p className="eq-eyebrow">Clients</p>
          <p className="eq-section-title mt-2">Mon compte</p>
          <p className="eq-section-lead">
            Consulter le solde et les informations du compte
          </p>
        </Link>
        <div className="eq-panel border-dashed">
          <p className="eq-eyebrow !text-[var(--equity-gray)]">Flux ekonzo</p>
          <p className="eq-section-title mt-2">OAuth &amp; paiements</p>
          <p className="eq-section-lead">
            Ouverts automatiquement depuis ekonzo (
            <code className="text-[11px]">/oauth/authorize</code>,{" "}
            <code className="text-[11px]">/payments/pay</code>).
          </p>
        </div>
      </div>
    </main>
  );
}
