import { config } from "dotenv";
config({ path: ".env" });

import { createHash, randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = false;
neonConfig.pipelineConnect = false;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const staffEmail = process.env.SEED_STAFF_EMAIL ?? "ops@equity.cd";
  const staffPassword = process.env.SEED_STAFF_PASSWORD ?? "Equity@Staff1";
  const customerPassword = process.env.SEED_CUSTOMER_PASSWORD ?? "Client@1234";

  const staffHash = await hash(staffPassword, 12);
  await prisma.staffUser.upsert({
    where: { email: staffEmail },
    update: { passwordHash: staffHash, name: "Opérations Equity" },
    create: {
      email: staffEmail,
      name: "Opérations Equity",
      passwordHash: staffHash,
    },
  });

  const demoCustomers = [
    {
      email: "jean.mbala@email.cd",
      nom: "Mbala",
      postnom: "Kabasele",
      prenom: "Jean",
      fullName: "Mbala Kabasele Jean",
      accountNumber: "000123456789",
      accountName: "Mbala Kabasele Jean",
      currency: "CDF" as const,
      balance: 75_000_000,
    },
    {
      email: "claire.kabila@email.cd",
      nom: "Kabila",
      postnom: "Mwanza",
      prenom: "Claire",
      fullName: "Kabila Mwanza Claire",
      accountNumber: "000987654321",
      accountName: "Kabila Mwanza Claire",
      currency: "USD" as const,
      balance: 25_000,
    },
  ];

  for (const c of demoCustomers) {
    const passwordHash = await hash(customerPassword, 12);
    await prisma.customer.upsert({
      where: { email: c.email },
      update: {
        passwordHash,
        fullName: c.fullName,
        nom: c.nom,
        postnom: c.postnom,
        prenom: c.prenom,
        accountNumber: c.accountNumber,
        accountName: c.accountName,
        currency: c.currency,
        balance: c.balance,
        isActive: true,
      },
      create: { ...c, passwordHash },
    });
  }

  const clientId =
    process.env.EKONZO_CLIENT_ID ?? `ekz_${randomBytes(12).toString("hex")}`;
  const clientSecret =
    process.env.EKONZO_CLIENT_SECRET ?? randomBytes(32).toString("hex");

  console.log("✅ Equity Bank — seed OK");
  console.log(`   Staff     : ${staffEmail} / ${staffPassword}`);
  console.log(`   Clients   : mot de passe ${customerPassword}`);
  for (const c of demoCustomers) {
    console.log(`     • ${c.email} · compte ${c.accountNumber}`);
  }
  console.log("");
  console.log("📋 À coller dans ekonzo (PartnerBank EXTERNAL) :");
  console.log(`   code            = EQUITY`);
  console.log(`   oauthClientId   = ${clientId}`);
  console.log(`   oauthClientSecret = ${clientSecret}`);
  console.log(`   authorizeUrl    = ${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"}/oauth/authorize`);
  console.log(`   tokenUrl        = ${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"}/api/oauth/token`);
  console.log(`   userinfoUrl     = ${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"}/api/oauth/userinfo`);
  console.log("");
  console.log(
    "   ⚠ Mettez les mêmes EKONZO_CLIENT_ID / EKONZO_CLIENT_SECRET dans equity-bank/.env",
  );

  // Affiche un hash factice pour éviter unused import si random used only above
  void createHash("sha256").update(clientId).digest("hex").slice(0, 8);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
