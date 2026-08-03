import { notFound } from "next/navigation";
import Link from "next/link";
import { contentPageSlugs, readContentTitle } from "@/lib/site";

const blogPostSlugs = [
  "how-productivity-scoring-works",
  "transparent-monitoring-for-modern-teams",
  "smb-guide-to-workforce-analytics",
];

export function generateStaticParams() {
  return [
    ...contentPageSlugs.map((slug) => ({ slug: [slug] })),
    ...blogPostSlugs.map((slug) => ({ slug: ["blog", slug] })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const full = slug.join("/");
  const title = readContentTitle(full);
  return { title: title ?? "Veracity" };
}

export default async function ContentStubPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const full = slug.join("/");
  const title = readContentTitle(full);
  if (!title) notFound();

  return (
    <div className="container-x pb-28 pt-32 sm:pt-40">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-ink"
      >
        <span aria-hidden="true">←</span> Back to home
      </Link>
      <h1 className="mt-8 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        This page is part of the full Veracity website and is being written now. While it is, the
        product&apos;s core commitments are already live on the home page — pricing, features, and
        compliance are all stated there.
      </p>
    </div>
  );
}
