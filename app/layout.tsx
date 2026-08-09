import type { Metadata } from "next";
import "./globals.css";
import "./kinetic.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
