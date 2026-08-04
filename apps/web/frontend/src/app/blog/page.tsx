import type { Metadata } from "next";
import { BlogHero } from "@/components/blog/BlogHero";
import { ReadingList } from "@/components/blog/ReadingList";
import { SubscribeSection } from "@/components/blog/SubscribeSection";
import { essays } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Veracity",
  description:
    "Veracity blog: the published productivity scoring methodology, why transparent monitoring works, and a practical SMB guide to workforce analytics.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <>
      <BlogHero />
      <ReadingList essays={essays} />
      <SubscribeSection />
    </>
  );
}
