import Link from "next/link";
import { listCustomers } from "@/modules/payment.service";
import { formatAmount } from "@/lib/utils";
import { PageIntro } from "@/components/ui/PageIntro";

export default async function PortalDashboardPage() {
  const customers = await listCustomers();
  const active = customers.filter((c) => c.isActive).length;
  const totalBalanceCdf = customers
    .filter((c) => c.currency === "CDF")
    .reduce((s, c) => s + Number(c.balance), 0);
  const totalBalanceUsd = customers
    .filter((c) => c.currency === "USD")
    .reduce((s, c) => s + Number(c.balance), 0);
  const recent = customers.slice(0, 5);

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Equity BCDC"
        title="Tableau de bord"
        description="Suivez vos clients internet banking et les soldes disponibles pour les règlements de titres publics."
      />

      <section aria-label="Indicateurs" className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Clients actifs"
          value={String(active)}
          sub={`${customers.length} au total`}
        />
        <Stat
          label="Soldes CDF"
          value={formatAmount(totalBalanceCdf, "CDF")}
          sub="Francs congolais"
        />
        <Stat
          label="Soldes USD"
          value={formatAmount(totalBalanceUsd, "USD")}
          sub="Dollars américains"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="eq-panel">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="eq-section-title">Clients récents</h2>
              <p className="eq-section-lead">Derniers comptes ouverts</p>
            </div>
            <Link href="/portal/customers" className="eq-link-quiet">
              Voir tous →
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="mt-6 rounded-xl bg-[var(--muted)] px-4 py-6 text-center text-sm text-[var(--equity-gray)]">
              Aucun client pour le moment. Créez le premier compte.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-[var(--border)]">
              {recent.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--equity-black)]">
                      {c.fullName}
                    </p>
                    <p className="truncate font-mono text-xs text-[var(--equity-gray)]">
                      {c.accountNumber}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold tabular-nums text-[var(--equity-black)]">
                    {formatAmount(Number(c.balance), c.currency)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="eq-panel-muted flex flex-col justify-between">
          <div>
            <p className="eq-eyebrow">Actions</p>
            <h2 className="eq-section-title mt-2">Gérer les clients</h2>
            <p className="eq-section-lead mt-2 leading-relaxed">
              Ouvrez un compte en CDF ou USD. Le numéro de compte est généré
              automatiquement.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/portal/customers" className="eq-btn-primary inline-flex">
              Ouvrir un compte →
            </Link>
            <Link href="/portal/docs" className="eq-link-quiet self-center">
              Documentation API →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <article className="eq-panel">
      <p className="eq-eyebrow !tracking-[0.14em] !text-[var(--equity-gray)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold tabular-nums tracking-tight text-[var(--equity-black)]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--equity-gray)]">{sub}</p>
    </article>
  );
}
