import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import Footer from "@/components/Footer";
import AnalyticsWrapper from "@/components/AnalyticsWrapper";

// URL canonique du site utilisée pour metadataBase et les liens absolus
const siteUrl = "https://tminer.io";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // IMPORTANT : metadataBase doit être défini explicitement avec l'URL canonique
  // pour que Next.js résolve correctement les chemins relatifs (ex: /og-image.png)
  metadataBase: new URL("https://tminer.io"),
  title: {
    default: "Truth Scanner - Neural Core Analysis",
    template: "%s | Truth Scanner",
  },
  description:
    "L'IA qui scanne des milliers de discussions Reddit pour extraire la vérité brute. Fini les faux avis.",
  keywords: [
    "Truth Scanner",
    "avis Reddit",
    "vérité Reddit",
    "analyse Reddit",
    "tendances Reddit",
    "opinions collectives",
    "analyse produits",
    "actualités",
    "tendances de société",
    "Neural Core",
  ],
  authors: [{ name: "Truth Scanner" }],
  creator: "Truth Scanner",
  publisher: "Truth Scanner",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "Truth Scanner",
    title: "Truth Scanner - Neural Core Analysis",
    description:
      "L'IA qui scanne des milliers de discussions Reddit pour extraire la vérité brute. Fini les faux avis.",
    images: [
      {
        // Laisser une URL RELATIVE : Next.js la convertira en URL absolue via metadataBase
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Truth Scanner - Neural Core Analysis",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Truth Scanner - Neural Core Analysis",
    description:
      "L'IA qui scanne des milliers de discussions Reddit pour extraire la vérité brute. Fini les faux avis.",
    // Garder un chemin relatif pour laisser metadataBase faire le travail
    images: ["/og-image.png"],
  },
  facebook: {
    appId: "966242223397117",
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
    canonical: siteUrl, // URL canonique absolue pour la page d'accueil
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
        <AnalyticsWrapper />
      </body>
    </html>
  );
}

