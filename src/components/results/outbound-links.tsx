import { ArrowUpRight } from "lucide-react";
import type { OutboundLink } from "@/lib/travel/types";

export function OutboundLinks({
  links,
  disclaimer,
}: {
  links: OutboundLink[];
  disclaimer?: string;
}) {
  if (!links.length) return null;
  return (
    <div className="mt-4 rounded-xl bg-surface/80 p-3 shadow-border">
      <p className="mb-2 text-[11px] font-medium tracking-wide text-faint uppercase">
        Open the same search
      </p>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={`${link.source}-${link.url}`}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-bg px-3 py-1.5 text-xs font-medium shadow-border transition-[box-shadow,transform] duration-150 hover:shadow-border-hover"
          >
            {link.label}
            <ArrowUpRight className="size-3 text-gold" />
          </a>
        ))}
      </div>
      {disclaimer ? <p className="mt-2 text-[11px] text-faint">{disclaimer}</p> : null}
    </div>
  );
}
