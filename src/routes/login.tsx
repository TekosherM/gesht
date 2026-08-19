import { createFileRoute, Link } from "@tanstack/react-router";
import { Atmosphere } from "@/components/atmosphere";
import { GeshtMark } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-bg px-6 text-fg">
      <Atmosphere />
      <div className="relative z-10 w-full max-w-sm rise-in">
        <Link to="/" className="mb-8 flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-fg">
            <GeshtMark className="size-4" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-xl">Gesht</span>
            <span className="block text-[11px] tracking-[0.18em] text-muted">گەشت</span>
          </span>
        </Link>
        <h1 className="font-display text-3xl tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Save searches and keep a short list of routes you are watching.
        </p>
        <div className="mt-6 space-y-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
        <Link to="/" className="mt-6 inline-block text-sm text-muted hover:text-fg">
          Back to search
        </Link>
      </div>
    </main>
  );
}
