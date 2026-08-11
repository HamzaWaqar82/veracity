import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArticleToc } from "./ArticleToc";
import { TableScroll } from "@/components/common/TableScroll";
import { TiltCard } from "@/components/common/TiltCard";
import { extractHeadings, headingId } from "@/lib/blog";

function headingText(children: ReactNode): string {
  const parts: string[] = [];
  const walk = (node: ReactNode) => {
    if (typeof node === "string" || typeof node === "number") {
      parts.push(String(node));
    } else if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (node && typeof node === "object" && "props" in node) {
      walk((node as { props?: { children?: ReactNode } }).props?.children);
    }
  };
  walk(children);
  return parts.join("").trim();
}

const components: Components = {
  h1: ({ children }) => (
    <h2 className="mb-6 mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2
      id={headingId(headingText(children))}
      className="mb-5 mt-14 scroll-mt-24 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      id={headingId(headingText(children))}
      className="mb-4 mt-12 scroll-mt-24 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl"
    >
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-3 mt-10 font-display text-lg font-semibold tracking-tight text-ink">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="mb-2 mt-8 text-[0.9375rem] font-bold uppercase tracking-[0.12em] text-ink">
      {children}
    </h5>
  ),
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
    <div className="my-8 [perspective:1400px]">
      <TiltCard maxAngle={1.5} className="rounded-2xl border border-line bg-surface">
        <TableScroll hint={false}>
          <table className="w-full border-collapse text-left">{children}</table>
        </TableScroll>
      </TiltCard>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-line">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody>{children}</tbody>
  ),
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

export function BlogPostBody({ markdown }: { markdown: string }) {
  const headings = extractHeadings(markdown);
  return (
    <div className="container-x py-section">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[15rem_minmax(0,46rem)] lg:justify-center">
        <aside className="hidden lg:block">
          <ArticleToc headings={headings} />
        </aside>
        <div className="mx-auto w-full min-w-0 max-w-3xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
