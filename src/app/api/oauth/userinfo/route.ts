import { NextRequest, NextResponse } from "next/server";
import { getUserinfo } from "@/modules/oauth.service";

/** GET /api/oauth/userinfo — contrat ekonzo */
export async function GET(req: NextRequest) {
  const header = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) {
    return NextResponse.json({ error: "Bearer token requis" }, { status: 401 });
  }
  try {
    const info = await getUserinfo(match[1].trim());
    return NextResponse.json(info);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Non autorisé" },
      { status: 401 },
    );
  }
}
