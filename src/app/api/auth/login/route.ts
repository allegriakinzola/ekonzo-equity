import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setStaffSession } from "@/lib/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
  const staff = await prisma.staffUser.findUnique({
    where: { email: body.data.email.trim().toLowerCase() },
  });
  if (!staff || !(await compare(body.data.password, staff.passwordHash))) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }
  await setStaffSession(staff.id);
  return NextResponse.json({
    ok: true,
    name: staff.name,
    email: staff.email,
  });
}
