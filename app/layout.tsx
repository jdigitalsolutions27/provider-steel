import type { Metadata } from "next";
import { Barlow_Condensed, Space_Grotesk } from "next/font/google";
import "./globals.css";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display"
});

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "G7 Provider Steel Works",
  description: "Colored roofing, steel frames, and fabrication with fast quotations and delivery.",
  icons: {
    icon: "/LOGO1.png",
    shortcut: "/LOGO1.png",
    apple: "/LOGO1.png"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${barlow.variable} ${space.variable}`}>
      <body className="min-h-screen bg-brand-navy font-body text-white antialiased">
        {children}
      </body>
    </html>
  );
}
