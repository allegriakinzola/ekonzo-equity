"use client";

import { useState } from "react";
import Link from "next/link";
import {
  EyeIcon,
  EyeSlashIcon,
  LockKeyIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { AlertBox } from "@/components/ui/AlertBox";
import { openAccountFromOauthPath } from "@/lib/oauth-continue";

export function OAuthLoginForm({
  clientId,
  redirectUri,
  state,
}: {
  clientId: string;
  redirectUri: string;
  state: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const openAccountHref = openAccountFromOauthPath({
    clientId,
    redirectUri,
    state,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/oauth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          client_id: clientId,
          redirect_uri: redirectUri,
          state,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connexion refusée");
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {error && <AlertBox>{error}</AlertBox>}

      <label className="eq-field">
        <span>Adresse e-mail</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          placeholder="votre@email.cd"
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
        className="eq-btn-primary w-full py-3.5 text-[15px]"
      >
        <LockKeyIcon className="size-4" weight="bold" aria-hidden />
        {loading ? "Autorisation…" : "Autoriser et continuer"}
      </button>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-[var(--border)]" />
        </div>
        <p className="relative mx-auto w-fit bg-white px-3 text-[11px] font-semibold tracking-wide text-[var(--equity-gray)] uppercase">
          ou
        </p>
      </div>

      <Link
        href={openAccountHref}
        className="eq-btn-ghost w-full justify-center py-3.5 text-[15px]"
      >
        <UserPlusIcon className="size-4" weight="bold" aria-hidden />
        Créer un compte bancaire
      </Link>
      <p className="text-center text-xs text-[var(--equity-gray)]">
        Pas encore de compte internet banking ? Ouvrez-en un, puis ekonzo sera
        autorisé automatiquement.
      </p>
    </form>
  );
}
