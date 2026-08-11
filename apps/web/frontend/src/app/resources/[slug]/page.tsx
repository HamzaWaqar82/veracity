import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_FILES, getEssay, readEssayMarkdown } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { BlogArticleHeader, KeepReading } from "@/components/blog/BlogArticleChrome";
import { BlogPostBody } from "@/components/blog/BlogPostBody";
import { ReadingProgress } from "@/components/blog/ReadingProgress";

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_FILES.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const essay = getEssay(slug);
  if (!essay) return {};
  return {
    title: essay.title,
    description: essay.deck,
    alternates: { canonical: `/resources/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const essay = getEssay(slug);
  const markdown = readEssayMarkdown(slug);
  if (!essay || !markdown) notFound();

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Resources", item: `${SITE_URL}/resources` },
      {
        "@type": "ListItem",
        position: 3,
        name: essay.title,
        item: `${SITE_URL}/resources/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <BlogArticleHeader essay={essay} />
      <ReadingProgress />
      <BlogPostBody markdown={markdown} />
      <KeepReading current={slug} />
    </>
  );
}
