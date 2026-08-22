import { createFileRoute } from "@tanstack/react-router";

function apiBase() {
  const raw = process.env.GESHT_API_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  // Local preview: FastAPI on 8788 (Neon when DATABASE_URL is set).
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8788";
  return "";
}

async function proxy(request: Request) {
  const base = apiBase();
  if (!base) {
    return Response.json({ ok: false, offline: true });
  }
  const incoming = new URL(request.url);
  const dest = `${base}${incoming.pathname}${incoming.search}`;
  const headers = new Headers();
  const accept = request.headers.get("accept");
  if (accept) headers.set("accept", accept);
  const res = await fetch(dest, { method: request.method, headers });
  const body = await res.arrayBuffer();
  return new Response(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}

export const Route = createFileRoute("/api/gesht/$")({
  server: {
    handlers: {
      GET: ({ request }) => proxy(request),
    },
  },
});
