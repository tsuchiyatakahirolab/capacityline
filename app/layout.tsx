import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CapacityLine — AI Supply Recovery Desk",
  description:
    "Call approved backup suppliers, verify live capacity, and surface the first actionable fallback before production stops.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
