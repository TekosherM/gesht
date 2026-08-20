import { createFileRoute } from "@tanstack/react-router";

function apiBase() {
  const raw = process.env.GESHT_API_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : "";
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
