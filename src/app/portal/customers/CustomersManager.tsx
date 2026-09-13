"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { formatAmount } from "@/lib/utils";
import { AlertBox } from "@/components/ui/AlertBox";
import { swalConfirm } from "@/lib/swal";

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

export function CustomersManager({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");

  async function onDelete(c: Row) {
    if (
      !(await swalConfirm({
        title: "Supprimer ce client ?",
        text: `${c.fullName} (${c.accountNumber}) — les sessions OAuth de ce client seront aussi révoquées.`,
        confirmText: "Supprimer",
        danger: true,
      }))
    ) {
      return;
    }
    setDeletingId(c.id);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/customers/${c.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Suppression impossible");
      setMessage(`Client ${c.fullName} supprimé.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--equity-gray)]">
          {initial.length} client{initial.length !== 1 ? "s" : ""}
        </p>
        <Link href="/open-account" className="eq-btn-primary">
          <PlusIcon className="size-4" weight="bold" aria-hidden />
          Nouveau client
        </Link>
      </div>

      {message && <AlertBox variant="success">{message}</AlertBox>}
      {error && <AlertBox>{error}</AlertBox>}

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
                <th scope="col" className="px-5 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {initial.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
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
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(c)}
                        disabled={deletingId === c.id}
                        className="eq-btn-ghost !px-2.5 !py-1.5 text-[var(--equity-red)] hover:border-[var(--equity-red)]"
                        aria-label={`Supprimer ${c.fullName}`}
                      >
                        <TrashIcon className="size-4" weight="bold" />
                        {deletingId === c.id ? "…" : "Supprimer"}
                      </button>
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
