import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSessionId } from "@/lib/session";
import { createCustomer, listCustomers } from "@/modules/payment.service";

async function requireStaff() {
  const id = await getStaffSessionId();
  if (!id) return null;
  return id;
}

export async function GET() {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const customers = await listCustomers();
  return NextResponse.json(customers);
}

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  nom: z.string().min(1),
  postnom: z.string().optional(),
  prenom: z.string().min(1),
  accountName: z.string().optional(),
  currency: z.enum(["CDF", "USD"]).optional(),
  balance: z.number().nonnegative().optional(),
});

export async function POST(req: NextRequest) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  try {
    const body = createSchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    const customer = await createCustomer(body.data);
    return NextResponse.json(
      {
        id: customer.id,
        email: customer.email,
        nom: customer.nom,
        postnom: customer.postnom,
        prenom: customer.prenom,
        fullName: customer.fullName,
        accountNumber: customer.accountNumber,
        currency: customer.currency,
      },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 409 },
    );
  }
}
