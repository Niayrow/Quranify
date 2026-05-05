import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Amiri } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic"],
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Quranify | Le Saint Coran en Ligne",
    template: "%s | Quranify",
  },
  description: "Écoutez et lisez le Saint Coran avec une interface moderne, fluide et immersive. Quranify offre une expérience spirituelle unique pour écouter les meilleurs récitateurs.",
  keywords: ["Coran", "Quran", "Islam", "Récitation", "Traduction", "Écouter Coran", "Lire Coran", "Quranify", "App Coran"],
  authors: [{ name: "Quranify" }],
  creator: "Quranify",
  publisher: "Quranify",
  metadataBase: new URL("https://quranify.fr"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://quranify.fr",
    title: "Quranify | Le Saint Coran en Ligne",
    description: "Écoutez et lisez le Saint Coran avec une interface moderne, fluide et immersive.",
    siteName: "Quranify",
    images: [
      {
        url: "/icon.png",
        width: 800,
        height: 800,
        alt: "Quranify - Le Saint Coran",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quranify | Le Saint Coran en Ligne",
    description: "Écoutez et lisez le Saint Coran avec une interface moderne, fluide et immersive.",
    images: ["/icon.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
    shortcut: "/icon.png",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} antialiased selection:bg-emerald-500/30 selection:text-emerald-200`}>
      <body className="min-h-screen bg-neutral-950 text-white font-sans overflow-x-hidden flex flex-col relative">
        {children}
      </body>
    </html>
  );
}
