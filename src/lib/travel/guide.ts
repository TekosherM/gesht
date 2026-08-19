import { createServerFn } from "@tanstack/react-start";
import { curatedBrief } from "./insights";
import type { GuideBrief, TravelMode } from "./types";

type GuideInput = {
  to: string;
  from?: string;
  mode: TravelMode;
  question?: string;
};

export const askGuide = createServerFn({ method: "POST" })
  .validator((input: GuideInput) => input)
  .handler(async ({ data }): Promise<GuideBrief & { answer?: string }> => {
    const fallback = curatedBrief(data.to, data.from, data.mode);
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return fallback;

    const prompt = data.question?.trim()
      ? `You are Gesht Guide, a concise local travel brief for Iraq and the Kurdistan Region (KRG).
Route: ${data.from ?? "unspecified"} → ${data.to}. Mode: ${data.mode}.
Answer this traveler question in at most 120 words. Plain prose, no markdown headings, no emoji.
If you are unsure, say what to verify (visa, checkpoint, airline) instead of guessing.
Question: ${data.question}`
      : `You are Gesht Guide, a concise local travel brief for Iraq and the Kurdistan Region (KRG).
Write four short labeled blocks exactly in this shape:
DESTINATION: (70-90 words on ${data.to})
JOURNEY: (70-90 words on traveling by ${data.mode} from ${data.from ?? "the origin"} to ${data.to})
WATCH: (3 short sentences, each on its own line, starting with - )
TIPS: (3 short sentences, each on its own line, starting with - )
No markdown headings, no emoji, no fluff. Be specific to this route.`;

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 420,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) return fallback;
      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = body.choices?.[0]?.message?.content?.trim();
      if (!text) return fallback;

      if (data.question?.trim()) {
        return { ...fallback, source: "live", answer: text };
      }

      const dest = sliceBlock(text, "DESTINATION") ?? fallback.destination;
      const journey = sliceBlock(text, "JOURNEY") ?? fallback.journey;
      const watch = bullets(sliceBlock(text, "WATCH")) ?? fallback.watchouts;
      const tips = bullets(sliceBlock(text, "TIPS")) ?? fallback.tips;
      return {
        ...fallback,
        destination: dest,
        journey,
        watchouts: watch,
        tips,
        source: "live",
      };
    } catch {
      return fallback;
    }
  });

function sliceBlock(text: string, label: string) {
  const re = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n(?:DESTINATION|JOURNEY|WATCH|TIPS):|$)`, "i");
  const m = text.match(re);
  return m?.[1]?.trim();
}

function bullets(block?: string) {
  if (!block) return undefined;
  const lines = block
    .split("\n")
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
  return lines.length ? lines : undefined;
}
