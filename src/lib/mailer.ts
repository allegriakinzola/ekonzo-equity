import nodemailer from "nodemailer";
import { optionalEnv } from "@/lib/env";

function getTransport() {
  const user = optionalEnv("SMTP_USER");
  const pass = optionalEnv("SMTP_PASS");
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendOtpEmail(to: string, code: string) {
  const from = optionalEnv("SMTP_USER");
  const text = [
    "Votre code de vérification Equity BCDC",
    "",
    `Code : ${code}`,
    "",
    "Il expire dans 5 minutes. Ne le communiquez à personne.",
    "",
    "— Equity BCDC",
  ].join("\n");

  console.log(`[OTP EMAIL] → ${to} (open-account) : ${code}`);

  const transport = getTransport();
  if (!transport || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP_USER et SMTP_PASS doivent être définis.");
    }
    return;
  }

  await transport.sendMail({
    from: `"Equity BCDC" <${from}>`,
    to,
    subject: "Votre code de vérification Equity BCDC",
    text,
    html: `
      <p style="font-family:Arial,sans-serif;font-size:15px;color:#111">
        Voici le code pour ouvrir votre compte internet banking Equity BCDC.
      </p>
      <p style="font-family:Georgia,serif;font-size:28px;letter-spacing:0.2em;font-weight:700;color:#a62626">
        ${code}
      </p>
      <p style="font-family:Arial,sans-serif;font-size:13px;color:#58595b">
        Il expire dans 5 minutes. Si vous n’avez pas demandé ce code, ignorez cet e-mail.
      </p>
    `,
  });
}
