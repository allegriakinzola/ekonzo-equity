import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { exchangeAuthorizationCode } from "@/modules/oauth.service";

const bodySchema = z.object({
  grant_type: z.string(),
  code: z.string().min(8),
  redirect_uri: z.string().url(),
  client_id: z.string().min(1),
  client_secret: z.string().min(1),
});

/** POST /api/oauth/token — contrat ekonzo */
export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }
    const token = await exchangeAuthorizationCode(body.data);
    return NextResponse.json(token);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 400 },
    );
  }
}
