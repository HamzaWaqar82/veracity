import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Essay = {
  slug: string;
  title: string;
  deck: string;
  readTime: string;
};

const blogRoot = path.join(process.cwd(), "..", "content", "pages", "blog");

export const BLOG_FILES = [
  "how-productivity-scoring-works",
  "transparent-monitoring-for-modern-teams",
  "smb-guide-to-workforce-analytics",
];

const DECK_RE = /^\*([^*\n]+)\*$/m;

function readEssay(file: string): Essay {
  const raw = fs.readFileSync(path.join(blogRoot, `${file}.md`), "utf8");
  const { data, content } = matter(raw);
  const title = String(data.title ?? file);
  const deckMatch = content.match(DECK_RE);
  const deck = deckMatch ? deckMatch[1].trim() : "";
  const plain = content.replace(/[#*_`>[\]()|-]/g, " ").replace(/\s+/g, " ").trim();
  const words = plain.split(" ").filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return {
    slug: file,
    title,
    deck,
    readTime: `${minutes} min read`,
  };
}

export const essays: Essay[] = BLOG_FILES.map(readEssay);

export function getEssay(slug: string): Essay | null {
  if (!BLOG_FILES.includes(slug)) return null;
  return essays.find((e) => e.slug === slug) ?? null;
}

export function readEssayMarkdown(slug: string): string | null {
  if (!BLOG_FILES.includes(slug)) return null;
  try {
    const { content } = matter(fs.readFileSync(path.join(blogRoot, `${slug}.md`), "utf8"));
    return content
      .replace(/^# [^\n]+\n\n\*[^*\n]+\*\n\n---\n\n/, "")
      .trim();
  } catch {
    return null;
  }
}
