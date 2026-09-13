import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  startOpenAccount,
  resendOpenAccountOtp,
  verifyOpenAccountOtp,
  extractOpenAccountDocument,
  completeOpenAccount,
} from "@/modules/open-account.service";
import { setCustomerSession } from "@/lib/session";
import { issueAuthorizationCode } from "@/modules/oauth.service";
import {
  oauthAuthorizePath,
  parseOauthContinue,
} from "@/lib/oauth-continue";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const startSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(1),
  currency: z.enum(["CDF", "USD"]),
});

const emailSchema = z.object({
  email: z.string().email(),
});

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const completeSchema = z.object({
  email: z.string().email(),
  docType: z.enum(["CNI", "PASSPORT"]),
  nom: z.string().min(1),
  postnom: z.string().optional(),
  prenom: z.string().min(1),
  dateOfBirth: z.string().optional(),
  docNumber: z.string().optional(),
  address: z.string().optional(),
});

function fail(e: unknown, fallback = "Erreur") {
  const message = e instanceof Error ? e.message : fallback;
  const status =
    message.includes("existe déjà") || message.includes("déjà utilisé")
      ? 409
      : message.includes("invalide") ||
          message.includes("requis") ||
          message.includes("expir") ||
          message.includes("correspondent")
        ? 400
        : 400;
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") ?? "start";

  try {
    if (action === "extract") {
      let formData: FormData;
      try {
        formData = await req.formData();
      } catch {
        return NextResponse.json(
          {
            error:
              "Impossible de lire la photo. Réessayez avec une image plus légère (JPEG/PNG).",
          },
          { status: 400 },
        );
      }

      const email = String(formData.get("email") ?? "")
        .trim()
        .toLowerCase();
      if (!email.includes("@")) {
        return NextResponse.json({ error: "E-mail requis" }, { status: 400 });
      }

      const docFront = formData.get("docFront");
      if (!(docFront instanceof File) || docFront.size === 0) {
        return NextResponse.json(
          { error: "Le recto du document est requis" },
          { status: 400 },
        );
      }
      if (docFront.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Fichier trop volumineux (max 5 Mo)" },
          { status: 400 },
        );
      }
      const mime = (docFront.type || "").toLowerCase();
      if (mime === "image/heic" || mime === "image/heif") {
        return NextResponse.json(
          {
            error:
              "Format HEIC non supporté. Exportez la photo en JPEG ou PNG.",
          },
          { status: 400 },
        );
      }
      if (mime && !ALLOWED_TYPES.includes(mime)) {
        return NextResponse.json(
          { error: `Format non supporté : ${docFront.type || "inconnu"}` },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await docFront.arrayBuffer());
      const extracted = await extractOpenAccountDocument({ email, buffer });
      return NextResponse.json({
        nom: extracted.lastName ?? "",
        postnom: extracted.postName ?? "",
        prenom: extracted.firstName ?? "",
        dateOfBirth: extracted.dateOfBirth ?? "",
        docNumber: extracted.docNumber ?? "",
        address: extracted.address ?? "",
      });
    }

    const json = await req.json();

    if (action === "start") {
      const body = startSchema.safeParse(json);
      if (!body.success) {
        return NextResponse.json({ error: "Données invalides" }, { status: 400 });
      }
      const result = await startOpenAccount(body.data);
      return NextResponse.json(result);
    }

    if (action === "resend") {
      const body = emailSchema.safeParse(json);
      if (!body.success) {
        return NextResponse.json({ error: "E-mail invalide" }, { status: 400 });
      }
      await resendOpenAccountOtp(body.data.email);
      return NextResponse.json({ ok: true });
    }

    if (action === "verify") {
      const body = otpSchema.safeParse(json);
      if (!body.success) {
        return NextResponse.json({ error: "Données invalides" }, { status: 400 });
      }
      const result = await verifyOpenAccountOtp(body.data.email, body.data.otp);
      return NextResponse.json(result);
    }

    if (action === "complete") {
      const body = completeSchema.safeParse(json);
      if (!body.success) {
        return NextResponse.json({ error: "Données invalides" }, { status: 400 });
      }
      const result = await completeOpenAccount(body.data);
      await setCustomerSession(result.id);

      const oauth = parseOauthContinue({
        client_id: json.client_id,
        redirect_uri: json.redirect_uri,
        state: json.state,
        response_type: "code",
      });

      if (oauth) {
        try {
          const code = await issueAuthorizationCode({
            customerId: result.id,
            clientId: oauth.clientId,
            redirectUri: oauth.redirectUri,
            state: oauth.state,
          });
          const redirect = new URL(oauth.redirectUri);
          redirect.searchParams.set("code", code);
          redirect.searchParams.set("state", oauth.state);
          return NextResponse.json(
            { ...result, redirectTo: redirect.toString() },
            { status: 201 },
          );
        } catch {
          return NextResponse.json(
            { ...result, redirectTo: oauthAuthorizePath(oauth) },
            { status: 201 },
          );
        }
      }

      return NextResponse.json({ ...result, redirectTo: "/account" }, { status: 201 });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (e) {
    return fail(e);
  }
}
