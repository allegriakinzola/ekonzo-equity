import nodemailer from "nodemailer";
import { smtpPass, smtpUser } from "@/lib/smtp";
import { buildOtpEmail } from "./email/otp";

function getTransport() {
  const user = smtpUser();
  const pass = smtpPass();
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendOtpEmail(to: string, code: string) {
  const from = smtpUser();
  const email = buildOtpEmail(code);

  console.log(`[OTP EMAIL] → ${to} (open-account) : ${code}`);

  const transport = getTransport();
  if (!transport || !from) {
    const userSet = Boolean(smtpUser());
    const passSet = Boolean(smtpPass());
    console.error(
      `[SMTP] variables absentes au runtime (SMTP_USER=${userSet}, SMTP_PASS=${passSet}). Sur Vercel : Project → Settings → Environment Variables → Production, puis Redeploy.`,
    );
    throw new Error(
      "Envoi du code impossible : SMTP_USER / SMTP_PASS absents sur le serveur. Ajoutez-les dans les Environment Variables Vercel du projet equity (Production), puis redéployez.",
    );
  }

  await transport.sendMail({
    from: `"Equity BCDC" <${from}>`,
    to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
}

export { buildOtpEmail } from "./email/otp";
export { renderEmailHtml } from "./email/layout";
export type { EmailContent } from "./email/layout";
