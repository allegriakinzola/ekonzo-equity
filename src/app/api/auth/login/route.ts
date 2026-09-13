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
  try {
    const body = schema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    const staff = await prisma.staffUser.findUnique({
      where: { email: body.data.email.trim().toLowerCase() },
    });
    if (!staff || !(await compare(body.data.password, staff.passwordHash))) {
      return NextResponse.json(
        { error: "Identifiants incorrects" },
        { status: 401 },
      );
    }
    await setStaffSession(staff.id);
    return NextResponse.json({
      ok: true,
      name: staff.name,
      email: staff.email,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur serveur";
    console.error("[auth/login]", message);
    const status = message.includes("Variable d'environnement") ? 503 : 500;
    return NextResponse.json(
      {
        error:
          status === 503
            ? "Configuration serveur incomplète (variables d'environnement)."
            : "Erreur de connexion à la base de données.",
      },
      { status },
    );
  }
}
