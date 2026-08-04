import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "FAQ — Veracity",
  description:
    "Frequently Asked Questions about Veracity's platform, pricing, compliance, and setup.",
  alternates: { canonical: "/faq" },
};

function generateId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const components: Components = {
  h2: ({ children }) => {
    const text = Array.isArray(children)
      ? children.filter((c) => typeof c === "string").join("")
      : typeof children === "string"
        ? children
        : "";
    const id = generateId(text);
    return (
      <h2
        id={id}
        className="mb-5 mt-14 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl scroll-mt-24"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }) => {
    const text = Array.isArray(children)
      ? children.filter((c) => typeof c === "string").join("")
      : typeof children === "string"
        ? children
        : "";
    const id = generateId(text);
    return (
      <h3
        id={id}
        className="mb-4 mt-12 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl scroll-mt-24"
      >
        {children}
      </h3>
    );
  },
  p: ({ children }) => (
    <p className="mb-6 text-[1.0625rem] leading-relaxed text-ink/90">{children}</p>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-primary">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-6 list-decimal space-y-2 pl-6 marker:text-primary">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-[1.0625rem] leading-relaxed text-ink/90">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-8 border-l-2 border-primary/40 pl-6 italic text-muted">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-12 border-line" />,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  pre: ({ children }) => (
    <pre className="my-8 overflow-x-auto rounded-xl border border-line bg-ink p-6 text-[0.875rem] leading-relaxed text-on-dark">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-") ?? false;
    if (isBlock) {
      return <code className={`block ${className ?? ""}`}>{children}</code>;
    }
    return (
      <code className="rounded bg-primary-soft px-1.5 py-0.5 font-mono text-[0.875em] font-medium text-primary">
        {children}
      </code>
    );
  },
  table: ({ children }) => (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-line">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-line last:border-b-0">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-muted">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 align-top text-[0.9375rem] leading-relaxed text-muted">{children}</td>
  ),
};

export default function FaqPage() {
  const faqPath = path.join(process.cwd(), "..", "content", "faq", "faq.md");
  let markdown = "";
  try {
    markdown = fs.readFileSync(faqPath, "utf8");
    // Remove the main "# Frequently Asked Questions" heading if present
    markdown = markdown.replace(/^# Frequently Asked Questions\n+/, "");
  } catch (error) {
    markdown = "Failed to load FAQ.";
  }

  return (
    <>
      <div className="container-x py-section pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-12 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
      <FinalCta />
    </>
  );
}
