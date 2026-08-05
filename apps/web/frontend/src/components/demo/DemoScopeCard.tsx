import { demoItems, office } from "@/components/about/about-data";

export function DemoScopeCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
        <p className="text-xs font-bold tracking-[0.16em] text-on-dark">WHAT THE DEMO COVERS</p>
        <p className="text-xs font-semibold text-on-dark-muted">30 MINUTES · LIVE</p>
      </div>
      <div className="flex flex-1 flex-col px-5 py-6 sm:px-6">
        <p className="text-[0.9375rem] leading-relaxed text-muted">
          A live demonstration of Veracity for teams evaluating the platform. A typical demo covers:
        </p>
        <ul className="mt-4 space-y-2.5">
          {demoItems.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-[0.9375rem] leading-relaxed text-ink">
              <span aria-hidden="true" className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-6">
          <a href="mailto:sales@veracity.dev" className="btn btn-outline">
            Email sales@veracity.dev
          </a>
        </div>
        <p className="mt-5 text-sm font-medium text-muted">{office}</p>
      </div>
    </div>
  );
}
