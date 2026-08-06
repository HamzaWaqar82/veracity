import type { MetadataRoute } from "next";
import { BLOG_FILES } from "@/lib/blog";

const SITE_URL = "https://veracity.dev";

const STATIC_ROUTES: Array<[string, number]> = [
  ["/", 1],
  ["/features", 0.9],
  ["/pricing", 0.9],
  ["/why-veracity", 0.8],
  ["/resources", 0.8],
  ["/about", 0.7],
  ["/faq", 0.7],
  ["/case-studies", 0.7],
  ["/integrations", 0.7],
  ["/compliance", 0.7],
  ["/contact-us", 0.6],
  ["/trial", 0.8],
  ["/request-demo", 0.8],
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC_ROUTES.map(([path, priority]) => ({
      url: `${SITE_URL}${path === "/" ? "" : path}`,
      priority,
    })),
    ...BLOG_FILES.map((slug) => ({
      url: `${SITE_URL}/resources/${slug}`,
      priority: 0.6,
    })),
  ];
}
