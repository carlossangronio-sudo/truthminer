import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tminer.io';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TruthMiner - Comparaisons de produits ultra-honnêtes",
    template: "%s | TruthMiner",
  },
  description: "Générez des articles de comparaison de produits basés sur les discussions Reddit. Découvrez la vérité sur les produits au-delà du marketing.",
  keywords: ["comparaison produits", "avis Reddit", "test produits", "vérité produits", "comparatif honnête"],
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
    title: "TruthMiner - Comparaisons de produits ultra-honnêtes",
    description: "Générez des articles de comparaison de produits basés sur les discussions Reddit",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "TruthMiner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TruthMiner - Comparaisons de produits ultra-honnêtes",
    description: "Générez des articles de comparaison de produits basés sur les discussions Reddit",
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
    <html lang="fr">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}

