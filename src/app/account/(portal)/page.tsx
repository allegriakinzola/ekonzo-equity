import { getCustomerSessionId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatAmount } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function AccountHomePage() {
  const customerId = await getCustomerSessionId();
  if (!customerId) redirect("/account/login");

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!customer) redirect("/account/login");

  return (
    <div className="space-y-6">
      <div>
        <p className="eq-eyebrow">Internet banking</p>
        <h1 className="eq-title mt-1">Mon compte</h1>
        <p className="eq-lead mt-2">
          Bonjour {customer.prenom || customer.fullName}. Voici votre compte Equity
          BCDC.
        </p>
      </div>

      <section className="eq-panel">
        <p className="eq-eyebrow">Solde disponible</p>
        <p className="mt-2 text-3xl font-extrabold tabular-nums tracking-tight text-[var(--equity-black)]">
          {formatAmount(Number(customer.balance), customer.currency)}
        </p>
        <dl className="mt-6 grid gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--equity-gray)]">
              Titulaire
            </dt>
            <dd className="mt-1 font-semibold text-[var(--equity-black)]">
              {customer.fullName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--equity-gray)]">
              N° de compte
            </dt>
            <dd className="mt-1 font-mono font-semibold text-[var(--equity-black)]">
              {customer.accountNumber}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--equity-gray)]">
              Devise
            </dt>
            <dd className="mt-1 font-semibold text-[var(--equity-black)]">
              {customer.currency}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--equity-gray)]">
              E-mail
            </dt>
            <dd className="mt-1 font-semibold text-[var(--equity-black)]">
              {customer.email}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
