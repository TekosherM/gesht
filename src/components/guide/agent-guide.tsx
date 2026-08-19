import { Compass, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { askGuide } from "@/lib/travel/guide";
import { curatedBrief } from "@/lib/travel/insights";
import { getPlace } from "@/lib/travel/places";
import type { GuideBrief, SearchQuery } from "@/lib/travel/types";
import { cn } from "@/lib/utils";

export function AgentGuide({
  query,
  open,
  onOpenChange,
}: {
  query: SearchQuery;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [brief, setBrief] = useState<GuideBrief>(() =>
    curatedBrief(query.to, query.from, query.mode),
  );
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setAnswer(null);
    setBrief(curatedBrief(query.to, query.from, query.mode));
    void askGuide({ data: { to: query.to, from: query.from, mode: query.mode } })
      .then((res) => {
        if (!cancelled) setBrief(res);
      })
      .catch(() => {
        /* curated already showing */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query.to, query.from, query.mode]);

  async function submitQuestion(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || asking) return;
    setAsking(true);
    try {
      const res = await askGuide({
        data: { to: query.to, from: query.from, mode: query.mode, question: q },
      });
      setAnswer(res.answer ?? res.journey);
      setBrief(res);
    } finally {
      setAsking(false);
    }
  }

  const dest = getPlace(query.to);

  return (
    <aside
      className={cn(
        "flex flex-col rounded-2xl bg-surface/90 shadow-border backdrop-blur-sm",
        open ? "flex" : "hidden lg:flex",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-fg">
            <Compass className="size-3.5" />
          </span>
          <div>
            <p className="text-sm font-medium">Gesht Guide</p>
            <p className="text-[11px] text-faint">
              {dest?.name}
              {brief.source === "live" ? " · live brief" : " · local brief"}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="text-xs text-muted lg:hidden"
          onClick={() => onOpenChange(false)}
        >
          Close
        </button>
      </div>

      <div className="flex flex-col gap-5 p-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <>
            <GuideBlock title={`About ${brief.destinationTitle}`} body={brief.destination} />
            <GuideBlock title={brief.journeyTitle} body={brief.journey} />
            {brief.watchouts.length ? (
              <div>
                <h3 className="text-xs font-medium tracking-wide text-faint uppercase">Watch-outs</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-muted">
                  {brief.watchouts.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {brief.tips.length ? (
              <div>
                <h3 className="text-xs font-medium tracking-wide text-faint uppercase">Tips</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-muted">
                  {brief.tips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}

        {answer ? (
          <div className="rounded-lg bg-bg p-3 text-sm rise-in">
            <p className="mb-1 text-xs font-medium text-primary">Guide</p>
            <p className="text-muted">{answer}</p>
          </div>
        ) : null}

        {mounted ? (
          <form onSubmit={submitQuestion} className="mt-auto flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about visas, the road, or the city"
              disabled={asking}
            />
            <Button type="submit" size="icon" disabled={asking || !question.trim()} aria-label="Ask">
              <Send className="size-4" />
            </Button>
          </form>
        ) : (
          <div className="h-11" />
        )}
      </div>
    </aside>
  );
}

function GuideBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-display text-lg tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
