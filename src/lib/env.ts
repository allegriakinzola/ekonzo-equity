/**
 * Lecture stricte des variables d'environnement (aucun fallback localhost / secret en dur).
 */
export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${name}. Définissez-la dans .env (local) ou dans les Environment Variables du projet (Vercel / production).`,
    );
  }
  return value;
}

export function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}
