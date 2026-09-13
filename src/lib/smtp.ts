/**
 * SMTP lu par accès statique à process.env.
 * Next.js / Vercel n'injecte pas les clés via process.env[nom] dynamique.
 * Les valeurs entre guillemets (copiées depuis un .env) sont nettoyées.
 */
function unquote(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim() || undefined;
  }
  return trimmed;
}

export function smtpUser(): string | undefined {
  return unquote(process.env.SMTP_USER);
}

export function smtpPass(): string | undefined {
  const pass = unquote(process.env.SMTP_PASS);
  // Mot de passe d'application Gmail : les espaces sont décoratifs.
  return pass ? pass.replace(/\s+/g, "") : undefined;
}
