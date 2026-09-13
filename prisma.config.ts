import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Pour `prisma generate` / migrate uniquement.
 * Runtime app : lit DATABASE_URL via src/lib/prisma.ts (sans fallback localhost).
 */
const datasourceUrl =
  process.env.DIRECT_URL?.trim() ||
  process.env.DATABASE_URL?.trim() ||
  // Placeholder generate-only — n'est jamais utilisé par l'app runtime
  "postgresql://postgres:postgres@127.0.0.1:5432/equity_bank?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: datasourceUrl,
  },
});
