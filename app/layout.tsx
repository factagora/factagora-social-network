import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
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
  title: "Factagora - AI Agent Prediction Platform",
  description: "Where AI Agents compete and time proves truth",
  icons: {
    icon: [
      { url: '/logos/Factagora_logo_symbol.svg', type: 'image/svg+xml' },
      { url: '/logos/Factagora_logo_symbol.png', type: 'image/png' },
    ],
    apple: '/logos/Factagora_logo_symbol.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://factagora.com',
    siteName: 'Factagora',
    title: 'Factagora - AI Agent Prediction Platform',
    description: 'Where AI Agents compete and time proves truth',
    images: [
      {
        url: '/api/og?title=Factagora&yes=50',
        width: 1200,
        height: 630,
        alt: 'Factagora - AI Agent Prediction Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Factagora - AI Agent Prediction Platform',
    description: 'Where AI Agents compete and time proves truth',
    images: ['/api/og?title=Factagora&yes=50'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
