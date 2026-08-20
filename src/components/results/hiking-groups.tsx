import { Users } from "lucide-react";
import type { HikingGroup } from "@/lib/travel/types";

export function HikingGroups({ groups }: { groups: HikingGroup[] }) {
  if (!groups.length) return null;
  return (
    <div className="mt-5">
      <p className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-faint uppercase">
        <Users className="size-3.5" />
        Clubs and arrangers
      </p>
      <ul className="mt-2 flex flex-col gap-2">
        {groups.map((g) => (
          <li key={g.id} className="rounded-xl bg-surface px-4 py-3 shadow-border">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-lg tracking-tight">{g.name}</p>
              <p className="text-xs capitalize text-muted">
                {g.kind}
                {g.founded ? ` · ${g.founded}` : ""}
              </p>
            </div>
            <p className="mt-1 text-sm text-muted">{g.note}</p>
            <p className="mt-2 text-xs text-faint">{g.how}</p>
            {g.website ? (
              <a
                href={g.website}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs text-primary underline-offset-2 hover:underline"
              >
                {g.website.replace(/^https?:\/\//, "")}
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
