import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { requireEnv } from "@/lib/env";

// Sur certains réseaux (Windows / proxy / serverless), le pipeline TLS Neon échoue.
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = false;
neonConfig.pipelineConnect = false;

/** Incrémenter après changement de schéma pour invalider le singleton HMR en dev */
const SCHEMA_VERSION = "person-name-parts-v1";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSchemaVersion?: string;
};

function databaseUrl() {
  // DATABASE_URL uniquement — jamais de fallback localhost (sinon Neon → wss://localhost/v2).
  const url = requireEnv("DATABASE_URL");
  if (!url.startsWith("postgres")) {
    throw new Error(
      "DATABASE_URL invalide : doit commencer par postgresql:// ou postgres://",
    );
  }
  return url;
}

function createPrismaClient() {
  const connectionString = databaseUrl();
  return new PrismaClient({
    adapter: new PrismaNeon({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    }),
    log:
      process.env.PRISMA_LOG_QUERIES === "1"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

const cached =
  globalForPrisma.prisma &&
  globalForPrisma.prismaSchemaVersion === SCHEMA_VERSION
    ? globalForPrisma.prisma
    : undefined;

export const prisma = cached ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaVersion = SCHEMA_VERSION;
}
