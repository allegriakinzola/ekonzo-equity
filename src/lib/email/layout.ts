/**
 * Templates e-mail Equity BCDC.
 * Charte : Montserrat, rouge toit #a62626, noir EQUITY, gris BCDC, barre 1909.
 */

const COLORS = {
  red: "#a62626",
  redDark: "#7f1d1d",
  black: "#111111",
  gray: "#58595b",
  graySoft: "#8a8b8d",
  border: "#ddd9d6",
  bg: "#f6f5f4",
  card: "#ffffff",
  muted: "#eeeceb",
} as const;

const FONT_SANS =
  "Montserrat, 'Helvetica Neue', Helvetica, Arial, sans-serif";

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001").replace(
    /\/$/,
    "",
  );
}

function emailAssetBase() {
  const env = appUrl();
  if (env && !/localhost|127\.0\.0\.1/.test(env)) return env;
  return "https://equity.ekonzo.site";
}

export type EmailContent = {
  heading: string;
  eyebrow?: string;
  bodyHtml: string;
  text: string;
  footerNote?: string;
  preheader?: string;
};

function heritageBar() {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px">
      <tr>
        <td width="36" style="height:4px;background-color:${COLORS.red};font-size:0;line-height:0;border-radius:1px 0 0 1px">&nbsp;</td>
        <td width="36" style="height:4px;background-color:${COLORS.gray};font-size:0;line-height:0;border-radius:0 1px 1px 0">&nbsp;</td>
      </tr>
    </table>
  `;
}

export function renderEmailHtml(content: EmailContent): string {
  const year = new Date().getFullYear();
  const base = appUrl();
  const logoSrc = `${emailAssetBase()}/equitylogo.png`;
  const footer =
    content.footerNote ??
    "Cet e-mail a été envoyé automatiquement. Equity BCDC ne vous demandera jamais votre mot de passe ni ce code par téléphone.";
  const eyebrow = content.eyebrow ?? "Internet banking";
  const preheader =
    content.preheader ?? `${content.heading} — Equity BCDC`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Equity BCDC</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, h1 { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${COLORS.bg};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;color:transparent">
    ${preheader}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.bg};margin:0;padding:0">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin:0 auto">
          <tr>
            <td align="center" style="padding:0 0 20px">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.card};border-radius:16px;border:1px solid ${COLORS.border}">
                <tr>
                  <td style="padding:14px 20px">
                    <img src="${logoSrc}" width="180" height="61" alt="Equity BCDC" style="display:block;border:0;outline:none;text-decoration:none;width:180px;height:auto;max-width:180px">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.card};border-radius:20px;overflow:hidden;border:1px solid ${COLORS.border}">
                <tr>
                  <td style="height:6px;background:linear-gradient(90deg,${COLORS.redDark} 0%,${COLORS.red} 50%,#5c1414 100%);font-size:0;line-height:0">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="50%" style="height:6px;background-color:${COLORS.red};font-size:0;line-height:0">&nbsp;</td>
                        <td width="50%" style="height:6px;background-color:${COLORS.redDark};font-size:0;line-height:0">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 28px 8px" align="left">
                    ${heritageBar()}
                    <p style="margin:0 0 10px;font-family:${FONT_SANS};font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.red}">
                      ${eyebrow}
                    </p>
                    <h1 style="margin:0;font-family:${FONT_SANS};font-size:22px;font-weight:800;letter-spacing:-0.025em;line-height:1.2;color:${COLORS.black}">
                      ${content.heading}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 28px 28px;font-family:${FONT_SANS};font-size:15px;line-height:1.65;color:${COLORS.black}">
                    ${content.bodyHtml}
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 28px">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${COLORS.border}">
                      <tr>
                        <td style="padding-top:18px;font-family:${FONT_SANS};font-size:12px;line-height:1.55;color:${COLORS.gray}">
                          ${footer}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 8px 0;font-family:${FONT_SANS};font-size:12px;line-height:1.5;color:${COLORS.gray}">
              <p style="margin:0 0 6px;font-weight:600;letter-spacing:0.04em;color:${COLORS.graySoft}">
                Depuis 1909 · République démocratique du Congo
              </p>
              <p style="margin:0">
                <a href="${base}" style="color:${COLORS.red};text-decoration:none;font-weight:700">Equity BCDC</a>
                · Portail partenaire ekonzo
              </p>
              <p style="margin:8px 0 0;color:${COLORS.graySoft}">© ${year} Equity BCDC</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailParagraph(text: string) {
  return `<p style="margin:0 0 16px;font-family:${FONT_SANS};font-size:15px;line-height:1.65;color:${COLORS.black}">${text}</p>`;
}

export function emailMuted(text: string) {
  return `<p style="margin:0 0 16px;font-family:${FONT_SANS};font-size:13px;line-height:1.55;color:${COLORS.gray}">${text}</p>`;
}

export function emailCodeBlock(code: string) {
  const digits = code
    .split("")
    .map(
      (d) =>
        `<td style="padding:0 3px"><div style="min-width:38px;height:50px;border-radius:12px;background-color:${COLORS.muted};border:1px solid ${COLORS.border};font-family:${FONT_SANS};font-size:22px;font-weight:800;line-height:50px;text-align:center;color:${COLORS.red};letter-spacing:0">${d}</div></td>`,
    )
    .join("");

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:12px auto 8px">
      <tr>
        ${digits}
      </tr>
    </table>
    <p style="margin:0 0 20px;text-align:center;font-family:${FONT_SANS};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.gray}">
      Code à usage unique · 5&nbsp;min
    </p>
  `;
}

export function emailButton(label: string, href: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px">
      <tr>
        <td style="border-radius:14px;background-color:${COLORS.red}">
          <a href="${href}" style="display:inline-block;padding:14px 28px;font-family:${FONT_SANS};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:14px">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export { COLORS, FONT_SANS, appUrl, emailAssetBase };
