import { config } from "dotenv";
config({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = false;
neonConfig.pipelineConnect = false;

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

const EMAILS = [
  "allegriakinzoladev@gmail.com",
  "allegriakinzolaessaie@gmail.com",
];

async function main() {
  const emails = EMAILS.map((e) => e.toLowerCase());

  const customers = await prisma.customer.findMany({
    where: { email: { in: emails, mode: "insensitive" } },
    select: {
      id: true,
      email: true,
      fullName: true,
      accountNumber: true,
    },
  });
  console.log("equity customers:", customers);

  const pending = await prisma.pendingCustomer.findMany({
    where: { email: { in: emails, mode: "insensitive" } },
    select: { id: true, email: true },
  });
  console.log("pending:", pending);

  const staff = await prisma.staffUser.findMany({
    where: { email: { in: emails, mode: "insensitive" } },
    select: { id: true, email: true, name: true },
  });
  console.log("staff:", staff);

  const accountNumbers = customers.map((c) => c.accountNumber);
  if (accountNumbers.length) {
    console.log(
      "paymentIntent",
      (
        await prisma.paymentIntent.deleteMany({
          where: { accountNumber: { in: accountNumbers } },
        })
      ).count,
    );
  }

  console.log(
    "pendingCustomer deleted",
    (
      await prisma.pendingCustomer.deleteMany({
        where: { email: { in: emails, mode: "insensitive" } },
      })
    ).count,
  );
  console.log(
    "customers deleted",
    (
      await prisma.customer.deleteMany({
        where: { email: { in: emails, mode: "insensitive" } },
      })
    ).count,
  );
  console.log(
    "staff deleted",
    (
      await prisma.staffUser.deleteMany({
        where: { email: { in: emails, mode: "insensitive" } },
      })
    ).count,
  );

  console.log(
    "leftover customers",
    await prisma.customer.findMany({
      where: { email: { in: emails, mode: "insensitive" } },
      select: { email: true },
    }),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
