import type { Metadata } from "next";
import { CapacityLineApp } from "@/components/capacity-line-app";

export const metadata: Metadata = {
  title: "Product sandbox — CapacityLine",
  description: "Explore a supplier recovery simulation and inspect the resulting evidence-backed decision without placing a call.",
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return <CapacityLineApp />;
}
