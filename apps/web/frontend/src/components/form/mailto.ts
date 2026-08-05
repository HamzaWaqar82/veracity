export type MailtoOptions = { to: string; subject: string; body: string };

export function buildBody(lines: Array<string | null | undefined>): string {
  return lines.filter((line): line is string => Boolean(line)).join("\n");
}

export function mailtoHref({ to, subject, body }: MailtoOptions): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
