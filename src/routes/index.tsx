import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Footprints, HeartPulse, House, Plane } from "lucide-react";
import type { ReactNode } from "react";
import { Atmosphere } from "@/components/atmosphere";
import { DestinationMedia } from "@/components/destination-media";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { LiveTicker } from "@/components/live-bits";
import { SearchConsole } from "@/components/search/search-console";
import { StarGlyph } from "@/components/star";
import { defaultDepartIso, defaultReturnIso } from "@/lib/travel/format";
import {
  featuredDestinations,
  getPlace,
  hikeDestinations,
  weekendDestinations,
} from "@/lib/travel/places";
import type { Place, TravelMode } from "@/lib/travel/types";

export const Route = createFileRoute("/")({ component: Home });

const HEADLINE = ["Search the", "next place", "you actually", "want to go."];

function preferMotion(places: Place[]) {
  return [...places].sort((a, b) => Number(Boolean(b.video)) - Number(Boolean(a.video)));
}

function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg text-fg">
      <Atmosphere />
      <div className="relative z-10">
        <SiteHeader />
        <main>
          <section className="relative">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-16 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div>
                <p className="rise-in flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-muted uppercase">
                  <StarGlyph className="size-2.5 text-gold" />
                  Iraq · Kurdistan Region · the road between
                </p>
                <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl lg:text-6xl">
                  {HEADLINE.map((line, i) => (
                    <span
                      key={line}
                      className={`rise-in stagger-${i + 1} block ${i === 1 ? "italic text-primary" : ""}`}
                    >
                      {line}
                    </span>
                  ))}
                </h1>
                <p className="rise-in stagger-5 mt-5 max-w-md text-base text-muted sm:text-lg">
                  <span className="font-display text-fg">گەشت</span>
                  <span className="mx-2 text-gold">·</span>
                  travel, in Kurdish. Flights, villas, trails, care — then a local brief
                  for the city and the way you get there.
                </p>
                <LiveTicker className="rise-in stagger-6 mt-7 max-w-md" />
              </div>
              <div className="rise-in stagger-4">
                <SearchConsole />
              </div>
            </div>
          </section>

          <PlaceSection
            id="destinations"
            kicker="Destinations"
            title={
              <>
                Where <em className="italic text-primary">Gesht</em> is strongest
              </>
            }
            places={featuredDestinations}
            mode="hotels"
          />

          <PlaceSection
            id="hiking"
            kicker="Hiking trips"
            title="Zagros trails and gorge days"
            lede="Gali Ali Beg on a weekday morning. Korek on the ridge. Halgurd if you actually mean a mountain."
            places={preferMotion(hikeDestinations.filter((p) => p.image))}
            mode="hiking"
            fallbackImage="/destinations/gali-ali-beg.jpg"
          />

          <PlaceSection
            id="weekends"
            kicker="Weekends nearby"
            title="Villas, apartments, Friday houses"
            lede="Erbil empties toward Shaqlawa and Dukan. Slemani walks Salim Street. Baghdad takes a Jadriya flat."
            places={preferMotion(weekendDestinations.filter((p) => p.image))}
            mode="weekends"
          />

          <PlaceSection
            id="care"
            kicker="Medical travel"
            title="Clinics, coordinators, the waiting room"
            lede="Stay in Erbil or Slemani when you can. Turkey is the default upgrade. Jordan for Arabic oncology. Iran by land from Slemani. India when the letter and the e-Medical visa come first."
            places={
              ["erbil", "istanbul", "amman", "tehran", "delhi", "sulaymaniyah"]
                .map((id) => getPlace(id))
                .filter((p): p is Place => Boolean(p))
            }
            mode="medical"
            still
            fallbackImage="/destinations/erbil.jpg"
          />

          <section id="how" className="border-t border-line/80">
            <div className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
              <How
                icon={Plane}
                title="Ask where to"
                body="Start with the city, the trail, or the clinic. Origin comes next if the mode needs it."
              />
              <How
                icon={Footprints}
                title="Walk the Zagros"
                body="Guided days on Hamilton Road, Korek, Ahmad Awa, and the high approach from Choman."
              />
              <How
                icon={House}
                title="Take the house"
                body="Villas and apartments for the Thursday–Saturday empty-out — lake, ridge, or city."
              />
              <How
                icon={HeartPulse}
                title="Travel for care"
                body="Stay home when the workup can be done here. Turkey, Jordan, Iran, and India when it cannot — letter first."
              />
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}

function PlaceSection({
  id,
  kicker,
  title,
  lede,
  places,
  mode,
  fallbackImage,
  still = false,
}: {
  id: string;
  kicker: string;
  title: ReactNode;
  lede?: string;
  places: Place[];
  mode: TravelMode;
  fallbackImage?: string;
  still?: boolean;
}) {
  return (
    <section id={id} className="border-t border-line/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-faint uppercase">
              <StarGlyph className="size-2.5 text-gold" />
              {kicker}
            </p>
            <h2 className="mt-1 font-display text-3xl tracking-tight">{title}</h2>
            {lede ? <p className="mt-2 max-w-xl text-sm text-muted">{lede}</p> : null}
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.slice(0, 6).map((place, i) => (
            <Link
              key={place.id}
              to="/search"
              search={{
                mode,
                to: place.id,
                from: mode === "medical" && place.region === "gateway" ? undefined : undefined,
                depart: defaultDepartIso(),
                returnDate: defaultReturnIso(),
                guests: 1,
                rooms: 1,
              }}
              className={`group relative isolate overflow-hidden rounded-xl bg-sunken shadow-border hover-lift rise-in stagger-${i + 1}`}
            >
              <DestinationMedia
                image={place.image ?? fallbackImage}
                video={still ? undefined : place.video}
              />
              <div className="absolute inset-0 bg-linear-to-t from-fg/75 via-fg/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-primary-fg">
                <p className="font-display text-2xl tracking-tight">{place.name}</p>
                <p className="text-sm text-primary-fg/80">{place.localName}</p>
                <p className="mt-1 line-clamp-2 text-xs text-primary-fg/75">{place.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function How({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Plane;
  title: string;
  body: string;
}) {
  return (
    <div className="hover-lift rounded-2xl bg-surface/80 p-5 shadow-border">
      <span className="grid size-10 place-items-center rounded-full bg-sunken text-primary">
        <Icon className="size-4" />
      </span>
      <h3 className="mt-4 font-display text-xl tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-muted">{body}</p>
      <p className="mt-3 inline-flex items-center gap-1 text-xs text-faint">
        Built into search
        <ArrowUpRight className="size-3" />
      </p>
    </div>
  );
}