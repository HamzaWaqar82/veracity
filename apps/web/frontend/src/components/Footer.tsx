import Link from "next/link";
import { essays, footer } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-primary-deep text-on-dark">
      <div className="container-x py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight">Veracity</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-on-dark-muted">
              Workforce analytics for small and medium businesses, built on transparency, not
              surveillance.
            </p>
            <p className="mt-6 text-sm font-semibold text-on-dark">
              No keystrokes. No video. No stealth. No emotion AI.
            </p>
          </div>
          <FooterCol title="Product" links={footer.product} />
          <FooterCol title="Company" links={footer.company} />
          <FooterCol
            title="From the resources"
            links={essays.map((e) => ({ label: e.label, href: e.href }))}
          />
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-on-dark-line/50 pt-8 text-sm text-on-dark-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Veracity</p>
          <p>Built for SMBs with 10–200 employees</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <nav aria-label={title}>
      <h3 className="text-sm font-semibold text-on-dark">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm text-on-dark-muted transition-colors hover:text-on-dark"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
