import type { Metadata } from "next";
import "./globals.css";
import "./kinetic.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  applicationName: "CapacityLine",
  title: "CapacityLine — AI Supply Recovery Desk",
  description:
    "Call approved backup suppliers, verify live capacity, and surface the first actionable fallback before production stops.",
  keywords: ["supply recovery", "procurement", "supplier capacity", "CALL-E", "manufacturing resilience"],
  openGraph: {
    title: "CapacityLine — AI Supply Recovery Desk",
    description: "Call suppliers. Secure capacity. Keep the line moving.",
    type: "website",
    siteName: "CapacityLine",
  },
  twitter: {
    card: "summary_large_image",
    title: "CapacityLine — AI Supply Recovery Desk",
    description: "Call suppliers. Secure capacity. Keep the line moving.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
