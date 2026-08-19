import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ResultBoard } from "@/components/results/result-board";
import { SearchConsole } from "@/components/search/search-console";
import { defaultDepartIso, defaultReturnIso } from "@/lib/travel/format";
import { isTravelMode } from "@/lib/travel/params";
import type { SearchQuery, TravelMode } from "@/lib/travel/types";

type SearchSearch = {
  mode: TravelMode;
  to: string;
  from?: string;
  depart: string;
  returnDate?: string;
  guests: number;
  rooms: number;
};

export const Route = createFileRoute("/search")({
  validateSearch: (raw: Record<string, unknown>): SearchSearch => ({
    mode: isTravelMode(raw.mode) ? raw.mode : "flights",
    to: typeof raw.to === "string" && raw.to ? raw.to : "erbil",
    from: typeof raw.from === "string" && raw.from ? raw.from : undefined,
    depart: typeof raw.depart === "string" && raw.depart ? raw.depart : defaultDepartIso(),
    returnDate:
      typeof raw.returnDate === "string" && raw.returnDate ? raw.returnDate : defaultReturnIso(),
    guests: Math.max(1, Number(raw.guests) || 1),
    rooms: Math.max(1, Number(raw.rooms) || 1),
  }),
  component: SearchPage,
});

function SearchPage() {
  const params = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [loading, setLoading] = useState(true);
  const query: SearchQuery = params;

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 220);
    return () => window.clearTimeout(t);
  }, [params.mode, params.to, params.from, params.depart, params.returnDate]);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader solid />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <SearchConsole initial={query} compact />
        <div className="mt-8">
          <ResultBoard
            query={query}
            loading={loading}
            onMode={(mode) => {
              void navigate({
                search: (prev) => ({ ...prev, mode }),
              });
            }}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
