import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticateCustomer,
  issueAuthorizationCode,
} from "@/modules/oauth.service";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  client_id: z.string().min(1),
  redirect_uri: z.string().url(),
  state: z.string().min(1),
});

/** Login client internet banking → code OAuth → redirect ekonzo */
export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    const customer = await authenticateCustomer(
      body.data.email,
      body.data.password,
    );
    const code = await issueAuthorizationCode({
      customerId: customer.id,
      clientId: body.data.client_id,
      redirectUri: body.data.redirect_uri,
      state: body.data.state,
    });
    const redirect = new URL(body.data.redirect_uri);
    redirect.searchParams.set("code", code);
    redirect.searchParams.set("state", body.data.state);
    return NextResponse.json({ redirectUrl: redirect.toString() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 401 },
    );
  }
}
