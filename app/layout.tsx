import type { Metadata } from "next";
import { Barlow_Condensed, Cormorant_Garamond, IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";
import "./kinetic.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const editorialFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});

const technicalFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-technical",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://capacityline.vercel.app"),
  applicationName: "CapacityLine",
  title: {
    default: "CapacityLine — Supplier recovery, from exception to evidence",
    template: "%s",
  },
  description:
    "Reach approved suppliers in parallel, verify comparable commitments, and hand procurement an evidence-backed recovery option before production stops.",
  keywords: ["supplier recovery", "procurement", "supplier capacity", "manufacturing resilience", "supply chain disruption"],
  authors: [{ name: "TSUCHIYA LAB", url: "https://tsuchiyalab.com" }],
  creator: "TSUCHIYA LAB",
  publisher: "TSUCHIYA LAB",
  openGraph: {
    title: "CapacityLine — Supplier recovery, from exception to evidence",
    description: "Parallel outreach. Verified commitments. Human authority.",
    type: "website",
    siteName: "CapacityLine",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "CapacityLine — recover the commitment" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CapacityLine — Supplier recovery, from exception to evidence",
    description: "Parallel outreach. Verified commitments. Human authority.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable} ${editorialFont.variable} ${technicalFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
