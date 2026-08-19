import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Bus, CarFront, Hotel, Plane } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SearchConsole } from "@/components/search/search-console";
import { featuredDestinations } from "@/lib/travel/places";
import { defaultDepartIso, defaultReturnIso } from "@/lib/travel/format";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden paper-grid">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-16 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="rise-in text-xs font-medium tracking-[0.18em] text-muted uppercase">
                Iraq · Kurdistan Region · the road between
              </p>
              <h1 className="rise-in stagger-1 mt-4 font-display text-4xl tracking-tight sm:text-5xl lg:text-6xl">
                Search the next place you actually want to go.
              </h1>
              <p className="rise-in stagger-2 mt-4 max-w-md text-base text-muted sm:text-lg">
                Flights, hotels, coaches, driving distance, and packages — then a local brief
                for the city and the way you get there.
              </p>
            </div>
            <div className="rise-in stagger-3">
              <SearchConsole />
            </div>
          </div>
        </section>

        <section id="destinations" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-faint uppercase">Destinations</p>
              <h2 className="mt-1 font-display text-3xl tracking-tight">Where Karwan is strongest</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDestinations.map((place, i) => (
              <Link
                key={place.id}
                to="/search"
                search={{
                  mode: "hotels" as const,
                  to: place.id,
                  depart: defaultDepartIso(),
                  returnDate: defaultReturnIso(),
                  guests: 1,
                  rooms: 1,
                }}
                className={`group relative isolate overflow-hidden rounded-xl bg-sunken rise-in stagger-${i + 1}`}
              >
                {place.image ? (
                  <img
                    src={place.image}
                    alt=""
                    className="aspect-16/10 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="aspect-16/10 w-full bg-sunken" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-fg/70 via-fg/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-primary-fg">
                  <p className="font-display text-2xl tracking-tight">{place.name}</p>
                  <p className="text-sm text-primary-fg/80">{place.localName}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-primary-fg/75">{place.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="how" className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            <How
              icon={Plane}
              title="Ask where to"
              body="Start with the city. We ask origin next — Istanbul, Dubai, or the next town over."
            />
            <How
              icon={Hotel}
              title="Compare sources"
              body="Airline, Wego, Skyscanner, the garage window. Prices sit next to each other."
            />
            <How
              icon={CarFront}
              title="Measure the road"
              body="Car search is distance-first: kilometres, hours, fuel, and the checkpoint count."
            />
            <How
              icon={Bus}
              title="Read the brief"
              body="A guide opens on the result — visa notes, the journey, what to watch."
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
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
    <div>
      <Icon className="size-5 text-primary" />
      <h3 className="mt-3 font-display text-xl tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-muted">{body}</p>
      <p className="mt-3 inline-flex items-center gap-1 text-xs text-faint">
        Built into search
        <ArrowUpRight className="size-3" />
      </p>
    </div>
  );
}
