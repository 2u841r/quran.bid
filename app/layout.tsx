import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PlausibleProvider from "next-plausible";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quran.bid | কুরআনবিদ",
  description: "নমুনা এবং API",
  icons: {
    icon: "https://fav.farm/📖",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PlausibleProvider domain="quran.bid">
        {children}
        </PlausibleProvider>
      </body>
    </html>
  );
}
