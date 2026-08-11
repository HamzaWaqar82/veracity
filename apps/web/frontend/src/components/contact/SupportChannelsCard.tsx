import { supportRows, emails } from "@/components/about/about-data";
import { TableScroll } from "@/components/common/TableScroll";
import { TiltCard } from "@/components/common/TiltCard";

export function SupportChannelsCard() {
  return (
    <TiltCard maxAngle={1.5} className="rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
        <p className="text-xs font-bold tracking-[0.16em] text-on-dark">SUPPORT CHANNELS</p>
        <p className="text-xs font-semibold text-on-dark-muted">SLA TABLE</p>
      </div>
      <TableScroll>
        <table className="w-full min-w-[30rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              <th
                scope="col"
                className="px-5 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted sm:px-6"
              >
                Channel
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted sm:px-6"
              >
                Availability
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-muted sm:px-6"
              >
                Target response
              </th>
            </tr>
          </thead>
          <tbody>
            {supportRows.map((row) => (
              <tr key={row.channel} className="border-b border-line last:border-b-0 hover:bg-white/60">
                <th
                  scope="row"
                  className="px-5 py-4 align-top text-[0.9375rem] font-semibold text-ink sm:px-6"
                >
                  {row.channel}
                </th>
                <td className="px-5 py-4 align-top text-[0.9375rem] text-muted sm:px-6">
                  {row.availability}
                </td>
                <td className="px-5 py-4 align-top text-[0.9375rem] font-semibold text-primary sm:px-6">
                  {row.response}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>

      <div className="border-t border-line bg-white/60 px-5 py-5 sm:px-6">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">
          Contact email addresses
        </p>
        <ul className="mt-3 space-y-1.5">
          {emails.map((item) => (
            <li key={item.email} className="flex flex-wrap gap-x-2 text-[0.9375rem]">
              <span className="font-semibold text-ink">{item.label}:</span>
              <a
                href={`mailto:${item.email}`}
                className="font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
              >
                {item.email}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </TiltCard>
  );
}
