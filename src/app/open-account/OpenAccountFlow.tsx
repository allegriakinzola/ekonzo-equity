"use client";

import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { AlertBox } from "@/components/ui/AlertBox";
import {
  displayDobWithoutYear,
  mergeDobKeepingYear,
} from "@/lib/date-of-birth";
import {
  compressImageForUpload,
  readJsonResponse,
} from "@/lib/client-upload";
import type { OauthContinue } from "@/lib/oauth-continue";

type Step = "account" | "otp" | "kyc";

type Extracted = {
  nom: string;
  postnom: string;
  prenom: string;
  dateOfBirth: string;
  docNumber: string;
  address: string;
};

const STEPS: { id: Step; label: string }[] = [
  { id: "account", label: "Compte" },
  { id: "otp", label: "Code" },
  { id: "kyc", label: "Identité" },
];

export function OpenAccountFlow({
  oauth,
}: {
  oauth?: OauthContinue | null;
}) {
  const [step, setStep] = useState<Step>("account");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currency, setCurrency] = useState<"CDF" | "USD">("CDF");
  const [otp, setOtp] = useState("");
  const [docType, setDocType] = useState<"CNI" | "PASSPORT">("CNI");
  const [fileName, setFileName] = useState("");
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [fields, setFields] = useState<Extracted>({
    nom: "",
    postnom: "",
    prenom: "",
    dateOfBirth: "",
    docNumber: "",
    address: "",
  });

  async function onStart(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/open-account?action=start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
          currency,
        }),
      });
      const data = await readJsonResponse<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Impossible d'envoyer le code");
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/open-account?action=verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });
      const data = await readJsonResponse<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Code invalide");
      setStep("kyc");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/open-account?action=resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await readJsonResponse<{ error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Renvoi impossible");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function onExtract(file: File) {
    setLoading(true);
    setError("");
    setExtracted(null);
    try {
      const compressed = await compressImageForUpload(file);
      setFileName(compressed.name);
      const form = new FormData();
      form.set("email", email.trim().toLowerCase());
      form.set("docFront", compressed);
      const res = await fetch("/api/open-account?action=extract", {
        method: "POST",
        body: form,
      });
      const data = await readJsonResponse<Extracted & { error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Extraction impossible");
      const next = {
        nom: data.nom ?? "",
        postnom: data.postnom ?? "",
        prenom: data.prenom ?? "",
        dateOfBirth: data.dateOfBirth ?? "",
        docNumber: data.docNumber ?? "",
        address: data.address ?? "",
      };
      setExtracted(next);
      setFields(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function onComplete(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/open-account?action=complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          docType,
          ...fields,
          ...(oauth
            ? {
                client_id: oauth.clientId,
                redirect_uri: oauth.redirectUri,
                state: oauth.state,
              }
            : {}),
        }),
      });
      const data = await readJsonResponse<{
        error?: string;
        redirectTo?: string;
      }>(res);
      if (!res.ok) throw new Error(data.error || "Création impossible");
      window.location.href = data.redirectTo || "/account";
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <ol className="flex items-center gap-2" aria-label="Étapes">
          {STEPS.map((s, i) => {
            const active = step === s.id;
            const done = STEPS.findIndex((x) => x.id === step) > i;
            return (
              <li key={s.id} className="flex flex-1 items-center gap-2">
                <span
                  className={
                    active || done
                      ? "flex size-7 items-center justify-center rounded-full bg-[var(--equity-red)] text-xs font-bold text-white"
                      : "flex size-7 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--equity-gray)]"
                  }
                >
                  {i + 1}
                </span>
                <span
                  className={
                    active
                      ? "text-xs font-bold text-[var(--equity-black)]"
                      : "text-xs font-semibold text-[var(--equity-gray)]"
                  }
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="h-px flex-1 bg-[var(--border)]" />
                )}
              </li>
            );
          })}
        </ol>

      {error && <AlertBox>{error}</AlertBox>}

      {step === "account" && (
        <form onSubmit={onStart} className="space-y-4" noValidate>
          <label className="eq-field">
            <span>Adresse e-mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="vous@email.cd"
            />
          </label>
          <label className="eq-field">
            <span>Mot de passe</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="8 caractères minimum"
                className="pr-11"
              />
              <button
                type="button"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-lg p-1.5 text-[var(--equity-gray)] hover:bg-[var(--muted)]"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="size-5" />
                ) : (
                  <EyeIcon className="size-5" />
                )}
              </button>
            </div>
          </label>
          <label className="eq-field">
            <span>Confirmation du mot de passe</span>
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          <label className="eq-field">
            <span>Devise du compte</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "CDF" | "USD")}
            >
              <option value="CDF">CDF — Franc congolais</option>
              <option value="USD">USD — Dollar américain</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="eq-btn-primary w-full py-3.5"
          >
            {loading ? "Envoi du code…" : "Recevoir le code par e-mail"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={onVerify} className="space-y-4">
          <p className="text-sm text-[var(--equity-gray)]">
            Un code à 6 chiffres a été envoyé à{" "}
            <strong className="text-[var(--equity-black)]">{email}</strong>.
          </p>
          <label className="eq-field">
            <span>Code OTP Equity</span>
            <input
              required
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              autoComplete="one-time-code"
              placeholder="000000"
              className="tracking-[0.35em]"
            />
          </label>
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="eq-btn-primary w-full py-3.5"
          >
            {loading ? "Vérification…" : "Valider le code"}
          </button>
          <button
            type="button"
            onClick={resend}
            disabled={loading}
            className="eq-link-quiet mx-auto"
          >
            Renvoyer le code
          </button>
        </form>
      )}

      {step === "kyc" && (
        <form onSubmit={onComplete} className="space-y-4">
          <label className="eq-field">
            <span>Type de document</span>
            <select
              value={docType}
              onChange={(e) =>
                setDocType(e.target.value as "CNI" | "PASSPORT")
              }
            >
              <option value="CNI">Carte d&apos;identité / électeur</option>
              <option value="PASSPORT">Passeport</option>
            </select>
          </label>
          <label className="eq-field">
            <span>Photo du document (recto)</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={!extracted}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onExtract(file);
              }}
            />
            {fileName && (
              <p className="mt-1 text-xs text-[var(--equity-gray)]">
                {loading ? "Lecture du document…" : fileName}
              </p>
            )}
          </label>

          {extracted && (
            <>
              <p className="text-xs text-[var(--equity-gray)]">
                Informations lues sur le document — corrigez si besoin, puis
                créez le compte.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="eq-field">
                  <span>Nom</span>
                  <input
                    required
                    value={fields.nom}
                    onChange={(e) =>
                      setFields({ ...fields, nom: e.target.value })
                    }
                  />
                </label>
                <label className="eq-field">
                  <span>Postnom</span>
                  <input
                    value={fields.postnom}
                    onChange={(e) =>
                      setFields({ ...fields, postnom: e.target.value })
                    }
                  />
                </label>
                <label className="eq-field sm:col-span-2">
                  <span>Prénom</span>
                  <input
                    required
                    value={fields.prenom}
                    onChange={(e) =>
                      setFields({ ...fields, prenom: e.target.value })
                    }
                  />
                </label>
                <label className="eq-field">
                  <span>Date de naissance</span>
                  <input
                    value={displayDobWithoutYear(fields.dateOfBirth)}
                    onChange={(e) =>
                      setFields({
                        ...fields,
                        dateOfBirth: mergeDobKeepingYear(
                          e.target.value,
                          fields.dateOfBirth,
                        ),
                      })
                    }
                    placeholder="JJ/MM"
                    inputMode="numeric"
                    aria-describedby="dob-hint"
                  />
                  <span
                    id="dob-hint"
                    className="mt-1.5 block text-xs font-normal text-[var(--equity-gray)]"
                  >
                    Jour et mois uniquement
                  </span>
                </label>
                <label className="eq-field">
                  <span>N° document</span>
                  <input
                    value={fields.docNumber}
                    onChange={(e) =>
                      setFields({ ...fields, docNumber: e.target.value })
                    }
                  />
                </label>
                <label className="eq-field sm:col-span-2">
                  <span>Adresse</span>
                  <input
                    value={fields.address}
                    onChange={(e) =>
                      setFields({ ...fields, address: e.target.value })
                    }
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="eq-btn-primary w-full py-3.5"
              >
                {loading ? "Création du compte…" : "Créer le compte bancaire"}
              </button>
            </>
          )}
        </form>
      )}
    </div>
  );
}
