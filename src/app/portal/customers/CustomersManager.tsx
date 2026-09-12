"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@phosphor-icons/react";
import { formatAmount } from "@/lib/utils";
import { AlertBox } from "@/components/ui/AlertBox";

type Row = {
  id: string;
  email: string;
  fullName: string;
  nom: string;
  postnom: string;
  prenom: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
};

const emptyForm = {
  email: "",
  password: "",
  nom: "",
  postnom: "",
  prenom: "",
  currency: "CDF",
  balance: "10000000",
};

export function CustomersManager({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdAccount, setCreatedAccount] = useState("");
  const [form, setForm] = useState(emptyForm);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCreatedAccount("");
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          balance: Number(form.balance),
          currency: form.currency,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Création impossible");
      setCreatedAccount(data.accountNumber as string);
      setForm(emptyForm);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--equity-gray)]">
          {initial.length} client{initial.length !== 1 ? "s" : ""}
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            setError("");
          }}
          className={open ? "eq-btn-ghost" : "eq-btn-primary"}
        >
          {open ? (
            "Annuler"
          ) : (
            <>
              <PlusIcon className="size-4" weight="bold" aria-hidden />
              Nouveau client
            </>
          )}
        </button>
      </div>

      {createdAccount && (
        <AlertBox variant="success">
          Compte créé — n°{" "}
          <span className="font-mono font-bold">{createdAccount}</span>
        </AlertBox>
      )}

      {open && (
        <form onSubmit={onCreate} className="eq-panel grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1">
            <p className="eq-eyebrow">Nouveau compte</p>
            <h2 className="eq-section-title">Créer un client</h2>
            <p className="eq-section-lead">
              Le numéro de compte sera attribué automatiquement.
            </p>
          </div>

          {error && (
            <div className="sm:col-span-2">
              <AlertBox>{error}</AlertBox>
            </div>
          )}

          <label className="eq-field">
            <span>Nom</span>
            <input
              required
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              autoComplete="family-name"
            />
          </label>
          <label className="eq-field">
            <span>Postnom</span>
            <input
              value={form.postnom}
              onChange={(e) => setForm({ ...form, postnom: e.target.value })}
            />
          </label>
          <label className="eq-field sm:col-span-2">
            <span>Prénom</span>
            <input
              required
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              autoComplete="given-name"
            />
          </label>
          <label className="eq-field">
            <span>Adresse e-mail</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </label>
          <label className="eq-field">
            <span>Mot de passe</span>
            <input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
          </label>
          <label className="eq-field">
            <span>Devise du compte</span>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option value="CDF">CDF — Franc congolais</option>
              <option value="USD">USD — Dollar américain</option>
            </select>
          </label>
          <label className="eq-field">
            <span>Solde initial</span>
            <input
              type="number"
              min={0}
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="eq-btn-primary py-3"
            >
              {loading ? "Création…" : "Créer le client"}
            </button>
          </div>
        </form>
      )}

      <div className="eq-panel overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]/60 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--equity-gray)]">
                <th scope="col" className="px-5 py-3.5">
                  Client
                </th>
                <th scope="col" className="px-5 py-3.5">
                  N° compte
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Solde
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {initial.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-[var(--equity-gray)]"
                  >
                    Aucun client enregistré
                  </td>
                </tr>
              ) : (
                initial.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[var(--border)] last:border-0 transition hover:bg-[var(--muted)]/40"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[var(--equity-black)]">
                        {c.fullName}
                      </p>
                      <p className="text-xs text-[var(--equity-gray)]">
                        {c.email}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <code className="rounded-md bg-[var(--muted)] px-2 py-1 font-mono text-xs text-[var(--equity-black)]">
                        {c.accountNumber}
                      </code>
                      <p className="mt-1 text-[11px] text-[var(--equity-gray)]">
                        {c.currency}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right font-bold tabular-nums text-[var(--equity-black)]">
                      {formatAmount(c.balance, c.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          c.isActive
                            ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                            : "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                        }
                      >
                        {c.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
