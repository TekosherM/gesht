import { ArrowUpRight } from "lucide-react";
import type { OutboundLink } from "@/lib/travel/types";

export function BookRow({ links }: { links: OutboundLink[] }) {
  if (!links.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {links.map((link) => (
        <a
          key={`${link.source}-${link.url}`}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-full bg-bg px-2.5 py-1 text-[11px] font-medium shadow-border transition-[box-shadow] hover:shadow-border-hover"
        >
          {link.label}
          <ArrowUpRight className="size-3 text-gold" />
        </a>
      ))}
    </div>
  );
}
