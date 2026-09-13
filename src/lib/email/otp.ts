import {
  emailCodeBlock,
  emailMuted,
  emailParagraph,
  renderEmailHtml,
} from "./layout";

export function buildOtpEmail(code: string) {
  const safeCode = code.replace(/[^0-9A-Za-z]/g, "").slice(0, 12);

  const heading = "Votre code de vérification";
  const intro =
    "Voici le code pour ouvrir votre compte internet banking Equity BCDC. Saisissez-le dans le formulaire — ne le partagez avec personne.";

  const bodyHtml = [
    emailParagraph(intro),
    emailCodeBlock(safeCode),
    emailMuted(
      "Si vous n’avez pas demandé ce code, ignorez cet e-mail. Votre compte n’est pas créé tant que l’ouverture n’est pas terminée.",
    ),
  ].join("");

  const text = [
    heading,
    "",
    intro,
    "",
    `Code : ${safeCode}`,
    "",
    "Il expire dans 5 minutes.",
    "Si vous n’avez pas demandé ce code, ignorez cet e-mail.",
    "",
    "— Equity BCDC · Depuis 1909",
  ].join("\n");

  return {
    subject: "Votre code de vérification Equity BCDC",
    text,
    html: renderEmailHtml({
      heading,
      eyebrow: "Internet banking",
      bodyHtml,
      text,
      preheader: `Code ${safeCode} — expire dans 5 minutes`,
      footerNote:
        "Ne communiquez jamais ce code. Equity BCDC ne vous le demandera pas par téléphone ni par e-mail.",
    }),
  };
}
