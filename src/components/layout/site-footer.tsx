import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-display text-fg">Gesht</span>
          <span className="mx-2 text-faint">گەشت</span>
          compares Iraq and Kurdistan travel — flights, rooms, coaches, trails, Friday houses, and care corridors. Prices are indicative; live seats live on the desk.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/" className="hover:text-fg">
            Search
          </Link>
          <Link to="/" hash="hiking" className="hover:text-fg">
            Hiking
          </Link>
          <Link to="/" hash="care" className="hover:text-fg">
            Care
          </Link>
          <Link to="/login" className="hover:text-fg">
            Account
          </Link>
        </div>
      </div>
    </footer>
  );
}
