import Link from "next/link";
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/icons";
import { SOCIAL, essays, footer } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-primary-deep text-on-dark">
      <div className="container-x py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight">Veracity</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-on-dark-muted">
              Workforce analytics for small and medium businesses, built on transparency, not
              surveillance.
            </p>
            <p className="mt-6 text-sm font-semibold text-on-dark">
              No keystrokes. No video. No stealth. No emotion AI.
            </p>
            {SOCIAL.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {SOCIAL.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noreferrer"
                    className="flex size-9 items-center justify-center rounded-full border border-on-dark-line/50 text-on-dark-muted transition-colors hover:border-on-dark-line hover:text-on-dark"
                  >
                    <SocialMark network={social.network} />
                  </a>
                ))}
              </div>
            )}
          </div>
          <FooterCol title="Product" links={footer.product} />
          <FooterCol title="Company" links={footer.company} />
          <FooterCol title="Legal" links={footer.legal} />
          <FooterCol
            title="From the resources"
            links={essays.map((e) => ({ label: e.label, href: e.href }))}
          />
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-on-dark-line/50 pt-8 text-sm text-on-dark-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Veracity</p>
          <p>Built for SMBs with 10-200 employees</p>
        </div>
      </div>
    </footer>
  );
}

function SocialMark({ network }: { network: (typeof SOCIAL)[number]["network"] }) {
  switch (network) {
    case "github":
      return <GitHubIcon className="size-4" />;
    case "x":
      return <XIcon className="size-4" />;
    case "linkedin":
      return <LinkedInIcon className="size-4" />;
  }
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
