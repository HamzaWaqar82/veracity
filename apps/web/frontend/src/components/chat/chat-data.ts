export type Suggestion = {
  label: string;
  prompt: string;
};

export const CHAT_COPY = {
  title: "Ask Veracity",
  subtitle: "Answers from this site's published content only.",
  greeting:
    "Hi - I answer questions about Veracity using only what's published on this site.",
  placeholder: "Ask about Veracity\u2026",
  openLabel: "Open chat assistant",
  closeLabel: "Close chat",
  sendLabel: "Send message",
  sourcesLabel: "Sources",
  typing: "Veracity assistant is typing",
  footnote: "Answers are grounded in site content and link to their sources.",
  contactLinkLabel: "Can't find an answer? Talk to the team.",
  clearLabel: "Clear conversation",
  retryLabel: "Try again",
  replyPrefix: "Veracity assistant answered:",
  error:
    "I couldn't reach the answer service. Please try again in a moment.",
};

export const SUGGESTIONS: Suggestion[] = [
  { label: "What does Veracity capture?", prompt: "What does Veracity capture?" },
  { label: "What does Veracity never do?", prompt: "What does Veracity never do?" },
  { label: "Can employees see their own data?", prompt: "Can employees see their own data?" },
  { label: "How does pricing work?", prompt: "How does pricing work?" },
];
