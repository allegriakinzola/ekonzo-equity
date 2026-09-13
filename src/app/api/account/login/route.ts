import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setCustomerSession } from "@/lib/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    const customer = await prisma.customer.findUnique({
      where: { email: body.data.email.trim().toLowerCase() },
    });
    if (
      !customer ||
      !customer.isActive ||
      !(await compare(body.data.password, customer.passwordHash))
    ) {
      return NextResponse.json(
        { error: "Identifiants incorrects" },
        { status: 401 },
      );
    }
    await setCustomerSession(customer.id);
    return NextResponse.json({ ok: true, redirectTo: "/account" });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 },
    );
  }
}
