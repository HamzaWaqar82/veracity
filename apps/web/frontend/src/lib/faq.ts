import fs from "node:fs";
import path from "node:path";

export type FaqQuestion = {
  id: string;
  question: string;
  answer: string;
  answerText: string;
};

export type FaqCategory = {
  id: string;
  title: string;
  qas: FaqQuestion[];
};

export function generateFaqId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function stripMarkdown(md: string) {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, (_, label: string) => label)
    .replace(/\*\*([^*]+)\*\*/g, (_, text: string) => text)
    .replace(/`([^`]+)`/g, (_, code: string) => code)
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export function loadFaqCategories(): FaqCategory[] {
  const faqPath = path.join(process.cwd(), "..", "content", "faq", "faq.md");
  let markdown = "";
  try {
    markdown = fs.readFileSync(faqPath, "utf8");
  } catch {
    return [];
  }

  const categories: FaqCategory[] = [];
  let category: FaqCategory | null = null;
  let question: FaqQuestion | null = null;
  const body: string[] = [];

  const flushQuestion = () => {
    if (category && question) {
      question.answer = body.join("\n").trim();
      question.answerText = stripMarkdown(question.answer);
    }
    question = null;
    body.length = 0;
  };

  for (const line of markdown.split(/\r?\n/)) {
    const categoryMatch = line.match(/^##\s+(.+)$/);
    if (categoryMatch) {
      flushQuestion();
      const title = categoryMatch[1].trim();
      category = { id: generateFaqId(title), title, qas: [] };
      categories.push(category);
      continue;
    }
    const questionMatch = line.match(/^###\s+(.+)$/);
    if (questionMatch) {
      flushQuestion();
      if (category) {
        const questionTitle = questionMatch[1].trim();
        question = {
          id: generateFaqId(questionTitle),
          question: questionTitle,
          answer: "",
          answerText: "",
        };
        category.qas.push(question);
      }
      continue;
    }
    if (category && question) body.push(line);
  }
  flushQuestion();

  return categories;
}

export function buildFaqSchema(categories: FaqCategory[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: categories.flatMap((category) =>
      category.qas.map((qa) => ({
        "@type": "Question",
        name: qa.question,
        acceptedAnswer: { "@type": "Answer", text: qa.answerText },
      })),
    ),
  };
}
