import type { MetadataRoute } from "next";
import { COMMERCIAL_USE_CASES } from "@/lib/use-cases";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://capacityline.vercel.app";
  const staticRoutes = ["", "/demo", "/solutions", "/pilot", "/trust"];
  return [
    ...staticRoutes.map((route, index) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date("2026-08-09"),
      changeFrequency: index === 0 ? "weekly" as const : "monthly" as const,
      priority: index === 0 ? 1 : route === "/demo" || route === "/solutions" ? 0.9 : 0.7,
    })),
    ...COMMERCIAL_USE_CASES.map((useCase) => ({
      url: `${baseUrl}/solutions/${useCase.slug}`,
      lastModified: new Date("2026-08-09"),
      changeFrequency: "monthly" as const,
      priority: useCase.initial ? 0.8 : 0.6,
    })),
  ];
}
