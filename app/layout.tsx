import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tminer.io';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TruthMiner - L'Avis des Vrais Utilisateurs Reddit",
    template: "%s | TruthMiner",
  },
  description: "L'IA qui analyse des milliers de discussions Reddit pour vous donner la vérité brute sur n'importe quel produit. Ne vous faites plus avoir.",
  keywords: ["TruthMiner", "avis Reddit", "vérité produits", "analyse Reddit", "comparaison honnête", "test produits", "avis utilisateurs", "vérité brute"],
  authors: [{ name: "TruthMiner" }],
  creator: "TruthMiner",
  publisher: "TruthMiner",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "TruthMiner",
    title: "TruthMiner - L'Avis des Vrais Utilisateurs Reddit",
    description: "L'IA qui analyse des milliers de discussions Reddit pour vous donner la vérité brute sur n'importe quel produit. Ne vous faites plus avoir.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "TruthMiner - L'Avis des Vrais Utilisateurs Reddit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TruthMiner - L'Avis des Vrais Utilisateurs Reddit",
    description: "L'IA qui analyse des milliers de discussions Reddit pour vous donner la vérité brute sur n'importe quel produit. Ne vous faites plus avoir.",
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        <ThemeProvider>
          <div className="flex-1">{children}</div>
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

