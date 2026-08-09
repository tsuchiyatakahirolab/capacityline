import type { Metadata } from "next";
import { CapacityLineApp } from "@/components/capacity-line-app";

export const metadata: Metadata = {
  title: "Interactive product demo — CapacityLine",
  description: "Run a zero-call supplier recovery replay and inspect the resulting evidence-backed decision.",
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return <CapacityLineApp />;
}
