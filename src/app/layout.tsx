import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Equity BCDC — Portail partenaire ekonzo",
  description:
    "Internet banking Equity BCDC : liaison de compte et paiement des titres publics ekonzo",
  icons: {
    icon: "/equitylogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${montserrat.variable} min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
