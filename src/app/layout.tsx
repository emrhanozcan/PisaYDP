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
  title: "PisaYDP Takip Sistemi",
  description: "İtalya'da eğitim danışmanlığı - Yaşam Destek Paketi Takip Sistemi | PisaYDP",
};

import StyledJsxRegistry from "./registry";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="15d1047b-45e7-4d94-ae9e-a9d2dddfc86f"
        />
      </head>
      <body>
        <StyledJsxRegistry>
          <main className="min-h-screen">
            {children}
          </main>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
