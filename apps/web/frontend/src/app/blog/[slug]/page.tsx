import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_FILES, getEssay, readEssayMarkdown, essays } from "@/lib/blog";
import { BlogArticleHeader, KeepReading } from "@/components/blog/BlogArticleChrome";
import { BlogPostBody } from "@/components/blog/BlogPostBody";

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
    title: `${essay.title} — Veracity Blog`,
    description: essay.deck,
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const essay = getEssay(slug);
  const markdown = readEssayMarkdown(slug);
  if (!essay || !markdown) notFound();
  const index = essays.findIndex((e) => e.slug === slug);

  return (
    <>
      <BlogArticleHeader essay={essay} index={index === -1 ? 0 : index} />
      <BlogPostBody markdown={markdown} />
      <KeepReading current={slug} />
    </>
  );
}
