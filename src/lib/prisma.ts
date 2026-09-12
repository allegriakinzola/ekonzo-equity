import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

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

function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaNeon({
      connectionString: process.env.DATABASE_URL!,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
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
