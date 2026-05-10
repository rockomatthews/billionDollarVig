import type { Metadata, Viewport } from "next";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://billiondollarvig.com",
  ),
  title: {
    default: "Billion Dollar Vig",
    template: "%s | Billion Dollar Vig",
  },
  description:
    "A crypto-native, mobile-friendly homage to the Million Dollar Homepage where 1,000,000 ad units climb to a $1B sellout.",
  openGraph: {
    title: "Billion Dollar Vig",
    description:
      "Buy a piece of a billion-dollar internet billboard with crypto.",
    url: "https://billiondollarvig.com",
    siteName: "Billion Dollar Vig",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} scanlines`}>
        {children}
      </body>
    </html>
  );
}
