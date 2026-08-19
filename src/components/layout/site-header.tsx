import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const { user, isPending } = useCurrentUserState();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-transparent",
        solid ? "border-line bg-bg/90 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-fg">
            <KarwanMark className="size-4" />
          </span>
          <span className="font-display text-xl tracking-tight">Karwan</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link to="/" className="hover:text-fg">
            Search
          </Link>
          <Link to="/" hash="destinations" className="hover:text-fg">
            Destinations
          </Link>
          <Link to="/" hash="how" className="hover:text-fg">
            How it works
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isPending ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-sunken" />
          ) : user ? (
            <UserButton />
          ) : (
            <Link
              to="/login"
              className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-fg shadow-border transition-[box-shadow] hover:shadow-border-hover"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function KarwanMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M4 18.5V9.2c0-.4.2-.8.5-1L12 3l7.5 5.2c.3.2.5.6.5 1v9.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8 18.5V11.4c0-.3.1-.5.4-.7L12 8.2l3.6 2.5c.3.2.4.4.4.7v7.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
