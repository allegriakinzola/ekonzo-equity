import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { confirmPaymentFromAccount } from "@/modules/payment.service";

const bodySchema = z.object({
  token: z.string().min(16),
  accountNumber: z.string().min(4),
  amount: z.number().positive(),
  currency: z.enum(["CDF", "USD"]),
  channel: z.enum(["BANK_TRANSFER", "MOBILE_MONEY"]).optional(),
  momoPhone: z.string().optional(),
});

/** Confirme le paiement compte / MoMo → notify ekonzo */
export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    const result = await confirmPaymentFromAccount(body.data);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Paiement refusé" },
      { status: 400 },
    );
  }
}
