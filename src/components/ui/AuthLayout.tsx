import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

/**
 * Shell auth public (login / OAuth / paiement).
 * Desktop : panneau brand Equity + contenu formulaire.
 * Mobile : logo + contenu.
 */
export function AuthLayout({
  brandTitle,
  brandText,
  brandEyebrow = "Depuis 1909 · République démocratique du Congo",
  children,
  className,
}: {
  brandTitle: string;
  brandText: string;
  brandEyebrow?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "eq-auth grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]",
        className,
      )}
    >
      <section className="eq-brand-panel relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between">
        <div className="eq-brand-glow" aria-hidden />
        <div className="eq-brand-grid" aria-hidden />

        <div className="relative z-10 px-12 pt-12">
          <div className="inline-flex rounded-2xl bg-white px-4 py-3 shadow-sm">
            <BrandLogo size="md" priority />
          </div>
        </div>

        <div className="relative z-10 max-w-lg px-12 pb-14">
          <div className="mb-5 h-1 w-16 overflow-hidden rounded-full bg-white/25">
            <div className="h-full w-1/2 bg-white" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">
            {brandEyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.15] tracking-tight">
            {brandTitle}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/80">
            {brandText}
          </p>
        </div>
      </section>

      <section className="relative flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-8 lg:hidden">
            <BrandLogo size="md" priority />
            <div className="equity-heritage-bar mt-4" />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
