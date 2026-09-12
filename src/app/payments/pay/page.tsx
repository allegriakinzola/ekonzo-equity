import { AuthLayout } from "@/components/ui/AuthLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { AlertBox } from "@/components/ui/AlertBox";
import { PayForm } from "./PayForm";
import { fetchEkonzoPaymentSession } from "@/lib/ekonzo";

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
      <AuthLayout
        brandTitle="Paiement sécurisé"
        brandText="Réglez vos Bons & Obligations du Trésor via votre compte Equity BCDC."
      >
        <PageIntro
          eyebrow="Titres publics"
          title="Paiement"
          description="Jeton manquant — relancez le paiement depuis ekonzo."
        />
        <div className="mt-8">
          <AlertBox>
            Jeton de paiement manquant. Relancez le paiement depuis ekonzo.
          </AlertBox>
        </div>
      </AuthLayout>
    );
  }

  let session;
  let error = "";
  try {
    session = await fetchEkonzoPaymentSession(token);
  } catch (e) {
    error = e instanceof Error ? e.message : "Session introuvable";
  }

  return (
    <AuthLayout
      brandTitle="Paiement sécurisé"
      brandText="Réglez vos Bons & Obligations du Trésor via votre compte Equity BCDC ou Mobile Money."
    >
      <PageIntro
        eyebrow="Titres publics"
        title="Paiement"
        description="Equity BCDC · pour le compte d'ekonzo"
      />

      <div className="eq-reveal eq-reveal-delay mt-8">
        {error || !session ? (
          <AlertBox>
            <p className="font-semibold">Paiement impossible</p>
            <p className="mt-1">{error || "Session introuvable"}</p>
            <p className="mt-2 text-[var(--equity-gray)]">
              Retournez sur ekonzo et relancez le paiement pour obtenir un
              nouveau lien.
            </p>
          </AlertBox>
        ) : (
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
        )}
      </div>
    </AuthLayout>
  );
}
