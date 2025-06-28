import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interv-ia | Préparation IA pour entretiens",
  description: "Préparez vos entretiens avec l'intelligence artificielle. Simulez des entretiens réalistes et améliorez vos compétences.",
  icons: {
    icon: '/logo2.jpeg',
    shortcut: '/logo2.jpeg',
    apple: '/logo2.jpeg',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Interv-ia | Préparation IA pour entretiens',
    description: 'Préparez vos entretiens avec l\'intelligence artificielle. Simulez des entretiens réalistes et améliorez vos compétences.',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interv-ia | Préparation IA pour entretiens',
    description: 'Préparez vos entretiens avec l\'intelligence artificielle.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning={true}>
      <head>
        <link rel="icon" href="/logo2.jpeg" />
        <link rel="shortcut icon" href="/logo2.jpeg" />
        <link rel="apple-touch-icon" href="/logo2.jpeg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
