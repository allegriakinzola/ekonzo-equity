"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon, LockKeyIcon } from "@phosphor-icons/react";
import { AuthLayout } from "@/components/ui/AuthLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { AlertBox } from "@/components/ui/AlertBox";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connexion impossible");
      router.push(data.redirectTo || "/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      brandTitle="Internet banking"
      brandText="Connectez-vous à votre compte Equity BCDC pour consulter votre solde et régler vos titres publics."
    >
      <PageIntro
        eyebrow="Espace client"
        title="Connexion"
        description="Identifiants de votre compte internet banking."
      />
      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        {error && <AlertBox>{error}</AlertBox>}
        <label className="eq-field">
          <span>Adresse e-mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="eq-field">
          <span>Mot de passe</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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
        <button
          type="submit"
          disabled={loading}
          className="eq-btn-primary w-full py-3.5"
        >
          <LockKeyIcon className="size-4" weight="bold" />
          {loading ? "Connexion…" : "Accéder à mon compte"}
        </button>
      </form>
      <p className="mt-8 text-center text-xs text-[var(--equity-gray)]">
        Pas encore de compte ?{" "}
        <Link href="/open-account" className="eq-link-quiet inline">
          Ouvrir un compte
        </Link>
      </p>
    </AuthLayout>
  );
}
