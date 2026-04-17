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
  title: "Dev Paraná — Sorteio",
  description: "Sorteio de prêmios do Dev Paraná. Importe participantes e sorteie ganhadores!",
  openGraph: {
    title: "Dev Paraná — Sorteio",
    description: "Sorteio de prêmios do Dev Paraná. Importe participantes e sorteie ganhadores!",
    siteName: "Dev Paraná Sorteio",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Dev Paraná — Sorteio",
    description: "Sorteio de prêmios do Dev Paraná",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
