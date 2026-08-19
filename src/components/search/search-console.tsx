import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowLeftRight,
  Bus,
  CarFront,
  Hotel,
  Luggage,
  Plane,
} from "lucide-react";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { DateField } from "@/components/search/date-field";
import { PlaceField } from "@/components/search/place-field";
import { Button } from "@/components/ui/button";
import { addDaysIso, prettyDate } from "@/lib/travel/format";
import { emptyDraft, modeMeta } from "@/lib/travel/params";
import { getPlace } from "@/lib/travel/places";
import type { Place, SearchQuery, TravelMode } from "@/lib/travel/types";
import { cn } from "@/lib/utils";

type Step = "to" | "from" | "when";

const modes: { id: TravelMode; icon: typeof Plane }[] = [
  { id: "flights", icon: Plane },
  { id: "hotels", icon: Hotel },
  { id: "packages", icon: Luggage },
  { id: "bus", icon: Bus },
  { id: "car", icon: CarFront },
];

export function SearchConsole({
  initial,
  compact = false,
}: {
  initial?: Partial<SearchQuery>;
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<SearchQuery>(() => ({
    ...emptyDraft(initial?.mode ?? "flights"),
    ...initial,
  }));
  const [step, setStep] = useState<Step>(initial?.to ? "when" : "to");
  const [expanded, setExpanded] = useState(!compact);

  const dest = draft.to ? getPlace(draft.to) : undefined;
  const origin = draft.from ? getPlace(draft.from) : undefined;
  const needsFrom = modeMeta[draft.mode].needsFrom;

  const prompt = useMemo(() => {
    if (step === "to") return "Where do you want to go?";
    if (step === "from") return "Where from?";
    return "When are you traveling?";
  }, [step]);

  function setMode(mode: TravelMode) {
    setDraft((d) => ({ ...d, mode }));
    if (!draft.to) setStep("to");
    else if (modeMeta[mode].needsFrom && !draft.from) setStep("from");
    else setStep("when");
  }

  function pickTo(place: Place) {
    setDraft((d) => ({
      ...d,
      to: place.id,
      from: d.from === place.id ? undefined : d.from,
    }));
    if (needsFrom) setStep("from");
    else setStep("when");
  }

  function pickFrom(place: Place) {
    setDraft((d) => ({ ...d, from: place.id }));
    setStep("when");
  }

  function swap() {
    if (!draft.from || !draft.to) return;
    const from = draft.from;
    const to = draft.to;
    setDraft((d) => ({ ...d, from: to, to: from }));
  }

  function submit() {
    if (!draft.to) {
      setExpanded(true);
      setStep("to");
      return;
    }
    if (needsFrom && !draft.from) {
      setExpanded(true);
      setStep("from");
      return;
    }
    void navigate({
      to: "/search",
      search: {
        mode: draft.mode,
        to: draft.to,
        from: draft.from,
        depart: draft.depart,
        returnDate: draft.returnDate,
        guests: draft.guests,
        rooms: draft.rooms,
      },
    });
  }

  return (
    <section
      className={cn(
        "w-full rounded-2xl bg-surface/90 p-3 shadow-lift backdrop-blur-sm sm:p-4",
        compact && "shadow-border",
      )}
    >
      <div className="flex gap-1 overflow-x-auto pb-1">
        {modes.map(({ id, icon: Icon }) => {
          const active = draft.mode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
                active ? "bg-primary text-primary-fg" : "text-muted hover:bg-sunken hover:text-fg",
              )}
            >
              <Icon className="size-4" />
              {modeMeta[id].label}
            </button>
          );
        })}
      </div>

      {compact && !expanded ? (
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium">
              {needsFrom && origin ? `${origin.name} → ${dest?.name}` : dest?.name}
            </p>
            <p className="text-muted">
              {prettyDate(draft.depart)}
              {draft.returnDate && draft.mode !== "bus" && draft.mode !== "car"
                ? ` – ${prettyDate(draft.returnDate)}`
                : ""}
              {` · ${draft.guests} traveler${draft.guests === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setExpanded(true)}>
              Edit search
            </Button>
            <Button size="sm" onClick={submit}>
              Search
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 px-1 sm:px-2">
            <p
              key={prompt}
              className="font-display text-2xl tracking-tight text-fg sm:text-3xl rise-in"
            >
              {prompt}
            </p>
            <p className="mt-1 text-sm text-muted">
              {draft.mode === "car"
                ? "We’ll measure the road — kilometres, hours, fuel, checkpoints."
                : draft.mode === "hotels"
                  ? "Pick a city. Dates next. Budget pensions in the KRG are often walk-in."
                  : "Kurdistan Region, Federal Iraq, or a gateway city."}
            </p>
          </div>

          <div className="mt-4 rounded-xl bg-bg p-3 sm:p-4">
            {step === "to" ? (
              <div className="rise-in">
                <PlaceField
                  label="Destination"
                  value={dest}
                  mode={draft.mode}
                  autoFocus={!compact}
                  onSelect={pickTo}
                />
              </div>
            ) : null}

            {step === "from" ? (
              <div className="rise-in">
                <div className="mb-3 flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={() => setStep("to")}>
                    <ArrowLeft className="size-4" />
                    {dest ? dest.name : "Back"}
                  </Button>
                </div>
                <PlaceField
                  label="Origin"
                  value={origin}
                  exclude={draft.to}
                  mode={draft.mode}
                  autoFocus
                  onSelect={pickFrom}
                />
              </div>
            ) : null}

            {step === "when" ? (
              <WhenStep
                draft={draft}
                setDraft={setDraft}
                dest={dest}
                origin={origin}
                needsFrom={needsFrom}
                onBack={() => setStep(needsFrom ? "from" : "to")}
                onSwap={swap}
                onTo={() => setStep("to")}
                onFrom={() => setStep("from")}
                onSubmit={submit}
              />
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}

function WhenStep({
  draft,
  setDraft,
  dest,
  origin,
  needsFrom,
  onBack,
  onSwap,
  onTo,
  onFrom,
  onSubmit,
}: {
  draft: SearchQuery;
  setDraft: Dispatch<SetStateAction<SearchQuery>>;
  dest?: Place;
  origin?: Place;
  needsFrom: boolean;
  onBack: () => void;
  onSwap: () => void;
  onTo: () => void;
  onFrom: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="rise-in flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          Change places
        </button>
        {needsFrom ? (
          <button
            type="button"
            onClick={onSwap}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
          >
            <ArrowLeftRight className="size-3.5" />
            Swap
          </button>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <PlaceChip
          kicker={needsFrom ? "From" : "Staying in"}
          place={needsFrom ? origin : dest}
          onClick={needsFrom ? onFrom : onTo}
        />
        {needsFrom ? (
          <>
            <span className="hidden justify-center text-faint sm:flex">→</span>
            <PlaceChip kicker="To" place={dest} onClick={onTo} />
          </>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DateField
          label={draft.mode === "hotels" ? "Check-in" : "Depart"}
          value={draft.depart}
          onChange={(depart) =>
            setDraft((d) => ({
              ...d,
              depart,
              returnDate:
                d.returnDate && d.returnDate < depart ? addDaysIso(depart, 3) : d.returnDate,
            }))
          }
        />
        {draft.mode !== "bus" && draft.mode !== "car" ? (
          <DateField
            label={draft.mode === "hotels" ? "Check-out" : "Return"}
            value={draft.returnDate ?? addDaysIso(draft.depart, 4)}
            min={draft.depart}
            onChange={(returnDate) => setDraft((d) => ({ ...d, returnDate }))}
          />
        ) : (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">Travelers</p>
            <Stepper
              value={draft.guests}
              min={1}
              max={8}
              onChange={(guests) => setDraft((d) => ({ ...d, guests }))}
            />
          </div>
        )}
      </div>

      {draft.mode === "hotels" || draft.mode === "packages" || draft.mode === "flights" ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">Travelers</p>
            <Stepper
              value={draft.guests}
              min={1}
              max={8}
              onChange={(guests) => setDraft((d) => ({ ...d, guests }))}
            />
          </div>
          {draft.mode === "hotels" ? (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted">Rooms</p>
              <Stepper
                value={draft.rooms}
                min={1}
                max={5}
                onChange={(rooms) => setDraft((d) => ({ ...d, rooms }))}
              />
            </div>
          ) : (
            <div />
          )}
        </div>
      ) : null}

      <Button size="lg" className="mt-1 w-full sm:ml-auto sm:w-auto" onClick={onSubmit}>
        Search {modeMeta[draft.mode].label.toLowerCase()}
      </Button>
    </div>
  );
}

function PlaceChip({
  kicker,
  place,
  onClick,
}: {
  kicker: string;
  place?: Place;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-surface px-3 py-2.5 text-left shadow-border"
    >
      <span className="block text-[11px] font-medium tracking-wide text-faint uppercase">
        {kicker}
      </span>
      <span className="block font-medium">{place?.name ?? "Choose"}</span>
      <span className="block text-xs text-muted">
        {place ? `${place.localName}${place.iata ? ` · ${place.iata}` : ""}` : "Tap to change"}
      </span>
    </button>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex h-11 items-center justify-between rounded-md bg-surface px-2 shadow-border">
      <button
        type="button"
        className="grid size-8 place-items-center rounded-md hover:bg-sunken"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease"
      >
        −
      </button>
      <span className="tabular-nums text-sm font-medium">{value}</span>
      <button
        type="button"
        className="grid size-8 place-items-center rounded-md hover:bg-sunken"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}
