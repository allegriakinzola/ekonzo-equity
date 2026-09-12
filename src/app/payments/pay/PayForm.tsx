"use client";

import { useState } from "react";
import { formatAmount } from "@/lib/utils";
import { AlertBox } from "@/components/ui/AlertBox";

type Method = "BANK_ACCOUNT" | "MOBILE_MONEY";

export function PayForm({
  token,
  amount,
  currency,
  productLabel,
  instrumentKind,
  accountNumber,
  accountName,
  returnUrl,
  alreadyPaid,
}: {
  token: string;
  clientId: string;
  amount: number;
  currency: string;
  productLabel: string;
  instrumentKind: string;
  accountNumber: string;
  accountName: string;
  returnUrl: string;
  alreadyPaid: boolean;
}) {
  const [method, setMethod] = useState<Method>("BANK_ACCOUNT");
  const [momoPhone, setMomoPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(alreadyPaid);
  const [fxNote, setFxNote] = useState("");

  const momoValid = /^[89]\d{8}$/.test(momoPhone.replace(/\D/g, ""));

  async function confirm() {
    setLoading(true);
    setError("");
    setFxNote("");
    try {
      if (method === "MOBILE_MONEY" && !momoValid) {
        throw new Error("Numéro Mobile Money invalide (9 chiffres, 8 ou 9…)");
      }
      const res = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          accountNumber,
          amount,
          currency,
          channel: method === "MOBILE_MONEY" ? "MOBILE_MONEY" : "BANK_TRANSFER",
          momoPhone: method === "MOBILE_MONEY" ? momoPhone : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Paiement refusé");
      if (data.fxApplied && data.debitAmount != null && data.debitCurrency) {
        setFxNote(
          `Débit converti : ${formatAmount(Number(data.debitAmount), data.debitCurrency)}`,
        );
      }
      setDone(true);
      window.setTimeout(() => {
        window.location.href = data.returnUrl || returnUrl;
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AlertBox variant="success">
        <p className="font-semibold">Paiement confirmé</p>
        {fxNote && <p className="mt-1">{fxNote}</p>}
        <p className="mt-1 text-[var(--equity-gray)]">Retour vers ekonzo…</p>
      </AlertBox>
    );
  }

  return (
    <div className="space-y-5">
      {error && <AlertBox>{error}</AlertBox>}

      <div className="rounded-2xl bg-[var(--muted)] p-5">
        <p className="eq-eyebrow !tracking-[0.14em] !text-[var(--equity-gray)]">
          Montant à régler
        </p>
        <p className="mt-2 text-3xl font-extrabold tabular-nums tracking-tight text-[var(--equity-black)]">
          {formatAmount(amount, currency)}
        </p>
        <p className="mt-2 text-sm text-[var(--equity-gray)]">
          {instrumentKind} · {productLabel}
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Mode de paiement"
        className="grid grid-cols-2 gap-2"
      >
        {(
          [
            ["BANK_ACCOUNT", "Compte bancaire"],
            ["MOBILE_MONEY", "Mobile Money"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={method === id}
            onClick={() => setMethod(id)}
            className={
              method === id
                ? "rounded-[var(--eq-radius)] border-2 border-[var(--equity-red)] bg-[var(--equity-red)]/5 px-3 py-3 text-sm font-bold text-[var(--equity-red)]"
                : "rounded-[var(--eq-radius)] border border-[var(--border)] bg-white px-3 py-3 text-sm font-semibold text-[var(--equity-gray)] hover:bg-[var(--muted)]"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {method === "BANK_ACCOUNT" ? (
        <div className="space-y-1 text-sm">
          <p className="text-[var(--equity-gray)]">Compte débité</p>
          <p className="font-bold text-[var(--equity-black)]">{accountName}</p>
          <p className="font-mono text-xs text-[var(--equity-gray)]">
            {accountNumber}
          </p>
          <p className="pt-2 text-xs leading-relaxed text-[var(--equity-gray)]">
            Si la devise du compte diffère du titre, le montant est converti
            automatiquement au débit.
          </p>
        </div>
      ) : (
        <label className="eq-field">
          <span>Numéro Mobile Money</span>
          <input
            value={momoPhone}
            onChange={(e) => setMomoPhone(e.target.value)}
            placeholder="890000001"
            inputMode="numeric"
            aria-describedby="momo-hint"
          />
          <span
            id="momo-hint"
            className="mt-1.5 block text-xs font-normal text-[var(--equity-gray)]"
          >
            9 chiffres commençant par 8 ou 9
          </span>
        </label>
      )}

      <button
        type="button"
        disabled={loading || (method === "MOBILE_MONEY" && !momoValid)}
        onClick={confirm}
        className="eq-btn-primary w-full py-3.5 text-[15px]"
      >
        {loading
          ? "Traitement…"
          : method === "MOBILE_MONEY"
            ? "Payer par Mobile Money"
            : "Confirmer le paiement"}
      </button>
    </div>
  );
}
