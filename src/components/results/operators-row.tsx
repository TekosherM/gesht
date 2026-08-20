import { Building2 } from "lucide-react";

export type Desk = {
  id: string;
  name: string;
  city?: string | null;
  website?: string | null;
  bookingStyle?: string;
  notes?: string | null;
};

export function OperatorsRow({ desks }: { desks: Desk[] }) {
  if (!desks.length) return null;
  return (
    <div className="mt-5">
      <p className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-faint uppercase">
        <Building2 className="size-3.5" />
        Desks that actually hold the seats
      </p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {desks.slice(0, 8).map((d) => (
          <li key={d.id} className="rounded-xl bg-surface px-3 py-2.5 shadow-border">
            <p className="text-sm font-medium">{d.name}</p>
            <p className="text-xs text-muted">
              {d.bookingStyle ?? "desk"}
              {d.city ? ` · ${d.city}` : ""}
            </p>
            {d.notes ? <p className="mt-1 line-clamp-2 text-xs text-faint">{d.notes}</p> : null}
            {d.website ? (
              <a
                href={d.website}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-xs text-primary underline-offset-2 hover:underline"
              >
                {d.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
