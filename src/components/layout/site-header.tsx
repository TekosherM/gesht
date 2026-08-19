import { Link } from "@tanstack/react-router";
import { LocalClock } from "@/components/live-bits";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const { user, isPending } = useCurrentUserState();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-transparent",
        solid ? "border-line/80 bg-bg/80 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-fg shadow-border">
            <GeshtMark className="size-4" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-xl tracking-tight">Gesht</span>
            <span className="block text-[11px] tracking-[0.18em] text-muted">گەشت</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted lg:flex">
          <Link to="/" className="transition-colors hover:text-fg">
            Search
          </Link>
          <Link to="/" hash="hiking" className="transition-colors hover:text-fg">
            Hiking
          </Link>
          <Link to="/" hash="weekends" className="transition-colors hover:text-fg">
            Weekends
          </Link>
          <Link to="/" hash="care" className="transition-colors hover:text-fg">
            Care
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <LocalClock />
          {isPending ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-sunken" />
          ) : user ? (
            <UserButton />
          ) : (
            <Link
              to="/login"
              className="inline-flex h-10 items-center rounded-full px-3 text-sm font-medium text-fg shadow-border transition-[box-shadow,transform] duration-150 hover:shadow-border-hover active:scale-[0.96]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function GeshtMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.2l1.5 4.2 4.3 1.5-4.3 1.5-1.5 4.3-1.5-4.3-4.3-1.5 4.3-1.5z"
        fill="currentColor"
      />
      <path
        d="M4.5 17.5c3.2-3.6 7-4.8 15-3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

