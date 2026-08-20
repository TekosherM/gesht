import { useEffect, useState } from "react";
import type { TravelMode } from "@/lib/travel/types";
import { cn } from "@/lib/utils";

const TICKS = [
  "EBL citadel · open till dusk",
  "IQD · 1 USD ≈ 1,320",
  "Erbil → Baghdad · 5h 20m by road",
  "Shaqlawa Friday traffic · leave Thursday",
  "Gali Ali Beg · weekday mornings quieter",
  "PAR Hospital Erbil · consults this week",
];

export function LiveTicker({ className }: { className?: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % TICKS.length), 4400);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-dashed border-gold/40 bg-surface/70 px-4 py-3 backdrop-blur-sm",
        className,
      )}
    >
      <span className="live-dot shrink-0" />
      <p key={i} className="ticker-item text-sm text-muted">
        {TICKS[i]}
      </p>
    </div>
  );
}

export function LocalClock() {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      setNow(`${hh}:${mm}`);
    };
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);

  if (!now) return <span className="hidden w-16 sm:inline-block" />;

  return (
    <span className="hidden tabular-nums text-xs tracking-wide text-muted sm:inline">
      {now} · AST
    </span>
  );
}

const SOURCE_SETS: Record<string, string[]> = {
  hiking: ["Zagros Mountain Trail", "Kurdistan Outdoors", "Rock Ur Bones", "Choman guides"],
  weekends: ["Booking", "Airbnb", "OpenSooq", "Villa broker"],
  medical: ["PAR Hospital", "Faruk Medical City", "Doctoury", "Acıbadem"],
  default: [
    "RideFly",
    "Wego",
    "Skyscanner",
    "Kayak",
    "Iraqi Airways",
    "Pegasus",
  ],
};

export function SourceSweep({ running, mode }: { running: boolean; mode?: TravelMode }) {
  const sources =
    (mode && SOURCE_SETS[mode]) || SOURCE_SETS.default;
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (!running) {
      setDone(sources.length);
      return;
    }
    setDone(0);
    const timers = sources.map((_, i) =>
      window.setTimeout(() => setDone(i + 1), 280 + i * 220),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [running, sources]);

  return (
    <div className="flex flex-wrap gap-2">
      {sources.map((name, i) => {
        const scanning = running && done === i;
        const ok = done > i;
        return (
          <span
            key={name}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors duration-300",
              scanning
                ? "border-gold/50 bg-sunken text-fg"
                : ok
                  ? "border-gold/35 bg-surface text-muted"
                  : "border-line bg-surface text-faint",
            )}
          >
            <i
              className={cn(
                "size-2 rounded-full border",
                scanning && "spin-scan border-gold",
                ok && "border-gold bg-gold",
                !scanning && !ok && "border-faint",
              )}
            />
            {name}
          </span>
        );
      })}
    </div>
  );
}

export function RouteArc({
  from,
  to,
  meta,
}: {
  from: string;
  to: string;
  meta?: string;
}) {
  return (
    <div className="flex items-center gap-3 sm:gap-5">
      <div>
        <p className="font-display text-2xl tracking-tight sm:text-3xl">{from}</p>
      </div>
      <div className="min-w-0 flex-1">
        <svg viewBox="0 0 170 40" className="h-10 w-full overflow-visible">
          <path
            id="gesht-arc"
            d="M6,32 C 50,6 120,6 164,32"
            fill="none"
            stroke="currentColor"
            className="text-line"
            strokeWidth="1.4"
            strokeDasharray="4 6"
          />
          <circle r="3.2" className="fill-gold">
            <animateMotion dur="4.5s" repeatCount="indefinite" rotate="auto">
              <mpath href="#gesht-arc" />
            </animateMotion>
          </circle>
        </svg>
        {meta ? <p className="text-center text-[11px] text-faint">{meta}</p> : null}
      </div>
      <div className="text-right">
        <p className="font-display text-2xl tracking-tight sm:text-3xl">{to}</p>
      </div>
    </div>
  );
}
