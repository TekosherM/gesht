import { BadgeCheck, MessageCircle } from "lucide-react";
import type { Provider } from "@/lib/travel/marketplace";
import { leadMessage, whatsappHref } from "@/lib/travel/marketplace";
import type { SearchQuery } from "@/lib/travel/types";

export function ProviderStrip({
  title,
  providers,
  query,
}: {
  title: string;
  providers: Provider[];
  query: SearchQuery;
}) {
  if (!providers.length) return null;
  return (
    <div className="mt-5">
      <p className="text-[11px] font-medium tracking-wide text-faint uppercase">{title}</p>
      <ul className="mt-2 flex flex-col gap-2">
        {providers.map((p) => (
          <li key={p.id} className="rounded-xl bg-surface px-4 py-3 shadow-border">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-lg tracking-tight">{p.name}</p>
              <p className="flex items-center gap-2 text-xs text-muted">
                {p.tier !== "free" ? (
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium tracking-wide text-gold uppercase">
                    Sponsored
                  </span>
                ) : p.club ? (
                  <span>free club</span>
                ) : p.claimed ? (
                  <span className="inline-flex items-center gap-1">
                    <BadgeCheck className="size-3" /> claimed
                  </span>
                ) : (
                  <span>unclaimed</span>
                )}
              </p>
            </div>
            <p className="mt-1 text-sm text-muted">{p.note}</p>
            <p className="mt-1 text-xs text-faint">{p.inventory}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              {p.whatsapp ? (
                <a
                  href={whatsappHref(p.whatsapp, leadMessage(p, query))}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <MessageCircle className="size-3.5" />
                  WhatsApp this desk
                </a>
              ) : (
                <span className="text-faint">No public WhatsApp yet — claim the desk.</span>
              )}
              {p.website ? (
                <a href={p.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {p.website.replace(/^https?:\/\//, "")}
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
