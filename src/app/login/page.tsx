"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon, LockKeyIcon } from "@phosphor-icons/react";
import { AuthLayout } from "@/components/ui/AuthLayout";
import { PageIntro } from "@/components/ui/PageIntro";
import { AlertBox } from "@/components/ui/AlertBox";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("ops@equity.cd");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connexion impossible");
      router.push("/portal");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      brandTitle="Equity BCDC"
      brandText="Espace sécurisé des agents pour l'internet banking et le règlement des titres publics."
    >
      <PageIntro
        eyebrow="Accès agents"
        title="Connexion"
        description="Identifiez-vous pour ouvrir l'espace opérations Equity BCDC."
      />

      <form
        onSubmit={onSubmit}
        className="eq-reveal eq-reveal-delay mt-8 space-y-5"
        noValidate
      >
        {error && <AlertBox>{error}</AlertBox>}

        <label className="eq-field">
          <span>Adresse e-mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            placeholder="prenom.nom@equity.cd"
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
              placeholder="••••••••"
              className="pr-11"
            />
            <button
              type="button"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-lg p-1.5 text-[var(--equity-gray)] transition hover:bg-[var(--muted)] hover:text-[var(--equity-black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--equity-red)]"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? (
                <EyeSlashIcon className="size-5" aria-hidden />
              ) : (
                <EyeIcon className="size-5" aria-hidden />
              )}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="eq-btn-primary mt-1 w-full py-3.5 text-[15px]"
        >
          <LockKeyIcon className="size-4" weight="bold" aria-hidden />
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className="eq-reveal eq-reveal-delay-2 mt-8 text-center text-xs text-[var(--equity-gray)]">
        <Link href="/" className="eq-link-quiet justify-center">
          Retour à l&apos;accueil
        </Link>
      </p>
    </AuthLayout>
  );
}
