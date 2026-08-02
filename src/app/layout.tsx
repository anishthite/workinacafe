import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const virgil = localFont({
  src: "./fonts/virgil.woff2",
  variable: "--font-virgil",
  display: "swap",
});

export const metadata: Metadata = {
  title: "workina.cafe — community café work map",
  description:
    "Find community-checked cafés with reliable Wi-Fi, outlets, quiet seats, and laptop-friendly policies.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable} ${virgil.variable}`}
      lang="en"
    >
      <body>{children}</body>
    </html>
  );
}
