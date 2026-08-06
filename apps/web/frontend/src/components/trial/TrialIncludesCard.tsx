import { CheckIcon } from "@/components/icons";

const includes = [
  "Full platform access for 14 days — every feature of your plan",
  "Agent for Windows, macOS, and Linux, installed in minutes",
  "Guided setup wizard to configure your first workspace",
  "Employee dashboards, Private Time, and compliance tooling from day one",
  "No credit card required and no seat minimum",
];

export function TrialIncludesCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
        <p className="text-xs font-bold tracking-[0.16em] text-on-dark">WHAT THE TRIAL INCLUDES</p>
        <p className="text-xs font-semibold text-on-dark-muted">14 DAYS · FULL ACCESS</p>
      </div>
      <div className="flex flex-1 flex-col px-5 py-6 sm:px-6">
        <p className="text-[0.9375rem] leading-relaxed text-muted">
          Everything you need to evaluate Veracity with a real team — no sales call required, and no
          data collected before your employees have seen the transparency controls.
        </p>
        <ul className="mt-4 space-y-2.5">
          {includes.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-ink">
              <span className="mt-[0.15em] flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <CheckIcon className="size-3" />
              </span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-auto pt-6 text-sm font-medium text-muted">
          Prefer to talk first?{" "}
          <a
            href="mailto:sales@veracity.dev"
            className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
          >
            Email sales@veracity.dev
          </a>
        </p>
      </div>
    </div>
  );
}
