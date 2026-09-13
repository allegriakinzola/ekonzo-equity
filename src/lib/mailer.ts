import nodemailer from "nodemailer";
import { optionalEnv } from "@/lib/env";
import { buildOtpEmail } from "./email/otp";

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
  const email = buildOtpEmail(code);

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
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
}

export { buildOtpEmail } from "./email/otp";
export { renderEmailHtml } from "./email/layout";
export type { EmailContent } from "./email/layout";
