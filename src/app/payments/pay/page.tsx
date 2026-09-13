import { BrandLogo } from "@/components/BrandLogo";
import { LockKeyIcon } from "@phosphor-icons/react/ssr";
import { AlertBox } from "@/components/ui/AlertBox";
import { PayForm } from "./PayForm";
import { fetchEkonzoPaymentSession } from "@/lib/ekonzo";
import { formatAmount } from "@/lib/utils";

function PayShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f1ef]">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <BrandLogo size="sm" priority />
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--equity-gray)]">
            <LockKeyIcon className="size-4 text-[var(--equity-red)]" weight="fill" />
            Paiement sécurisé
          </p>
        </div>
        <div className="equity-heritage-bar !flex !h-1 !w-full !rounded-none" />
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">{children}</main>
      <footer className="mx-auto max-w-5xl px-5 pb-10 text-center text-[11px] text-[var(--equity-gray)] sm:px-8">
        Transaction chiffrée · Equity BCDC · titres publics ekonzo
      </footer>
    </div>
  );
}

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const token = String(sp.token ?? "");
  const clientId = String(sp.client_id ?? "");

  if (!token || token.length < 16) {
    return (
      <PayShell>
        <h1 className="eq-title">Paiement</h1>
        <p className="eq-lead mt-2">Le lien de paiement est incomplet.</p>
        <div className="mt-6 max-w-lg">
          <AlertBox>
            Jeton de paiement manquant. Relancez le règlement depuis ekonzo.
          </AlertBox>
        </div>
      </PayShell>
    );
  }

  let session;
  let error = "";
  try {
    session = await fetchEkonzoPaymentSession(token);
  } catch (e) {
    error = e instanceof Error ? e.message : "Session introuvable";
  }

  if (error || !session) {
    return (
      <PayShell>
        <h1 className="eq-title">Paiement</h1>
        <p className="eq-lead mt-2">Impossible de charger cette opération.</p>
        <div className="mt-6 max-w-lg">
          <AlertBox>
            <p className="font-semibold">Paiement impossible</p>
            <p className="mt-1">{error || "Session introuvable"}</p>
            <p className="mt-2 text-[var(--equity-gray)]">
              Retournez sur ekonzo et relancez le paiement pour un nouveau lien.
            </p>
          </AlertBox>
        </div>
      </PayShell>
    );
  }

  return (
    <PayShell>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-start">
        <aside className="eq-panel space-y-5">
          <p className="eq-eyebrow">Récapitulatif</p>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--equity-gray)]">
              Montant
            </p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight text-[var(--equity-black)]">
              {formatAmount(session.amount, session.currency)}
            </p>
          </div>
          <dl className="space-y-3 border-t border-[var(--border)] pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--equity-gray)]">Bénéficiaire</dt>
              <dd className="font-semibold text-[var(--equity-black)]">ekonzo</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--equity-gray)]">Produit</dt>
              <dd className="text-right font-semibold text-[var(--equity-black)]">
                {session.instrumentKind} · {session.productLabel}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--equity-gray)]">Compte</dt>
              <dd className="text-right">
                <p className="font-semibold text-[var(--equity-black)]">
                  {session.accountName}
                </p>
                <p className="font-mono text-xs text-[var(--equity-gray)]">
                  {session.accountNumber}
                </p>
              </dd>
            </div>
          </dl>
        </aside>

        <section className="eq-panel">
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--equity-black)]">
            Régler cette opération
          </h1>
          <p className="mt-1 text-sm text-[var(--equity-gray)]">
            Choisissez le moyen de paiement puis confirmez le débit.
          </p>
          <div className="mt-6">
            <PayForm
              token={token}
              clientId={clientId}
              amount={session.amount}
              currency={session.currency}
              productLabel={session.productLabel}
              instrumentKind={session.instrumentKind}
              accountNumber={session.accountNumber}
              accountName={session.accountName}
              returnUrl={session.returnUrl}
              alreadyPaid={session.status === "PAID"}
            />
          </div>
        </section>
      </div>
    </PayShell>
  );
}
