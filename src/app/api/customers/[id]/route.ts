import { NextRequest, NextResponse } from "next/server";
import { getStaffSessionId } from "@/lib/session";
import { deleteCustomer } from "@/modules/payment.service";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getStaffSessionId())) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
  }

  try {
    const customer = await deleteCustomer(id);
    return NextResponse.json({ ok: true, id: customer.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    const status = message === "Client introuvable" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
