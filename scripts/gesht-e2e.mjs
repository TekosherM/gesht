#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.GESHT_BASE ?? "http://127.0.0.1:8080";

const journeys = [
  { id: "home-search-console", url: "/", expect: [/Where do you want to go|Search|Flights/] },
  { id: "home-care-copy", url: "/", expect: [/Turkey/, /Iran/, /India/, /Jordan/] },
  { id: "search-fly", url: "/search?mode=flights&from=istanbul&to=erbil", expect: [/Wego|Kayak|Turkish/] },
  { id: "search-hotel", url: "/search?mode=hotels&to=erbil", expect: [/Booking|Divan|Rotana/] },
  { id: "search-bus", url: "/search?mode=bus&from=istanbul&to=erbil", expect: [/Obilet|Best Van/] },
  { id: "search-car", url: "/search?mode=car&from=erbil&to=dukan", expect: [/Hertz|km|Drive/] },
  { id: "search-hike", url: "/search?mode=hiking&to=hawraman", expect: [/Hawraman|Tawela|Zagros/] },
  { id: "search-weekend", url: "/search?mode=weekends&to=shaqlawa", expect: [/Airbnb|Booking|villa|Villa|house/i] },
  { id: "search-care-home", url: "/search?mode=medical&to=erbil", expect: [/Turkey/, /PAR|CMC|Stay in/] },
  { id: "search-care-tr", url: "/search?mode=medical&to=istanbul", expect: [/Acıbadem|Memorial|Medipol/] },
  { id: "search-care-jo", url: "/search?mode=medical&to=amman", expect: [/King Hussein|Abdali|Istishari/] },
  { id: "search-care-ir", url: "/search?mode=medical&to=tehran", expect: [/Royan|Heart Center/] },
  { id: "search-care-in", url: "/search?mode=medical&to=delhi", expect: [/Medanta|Fortis|e-Medical/] },
  { id: "search-packages", url: "/search?mode=packages&to=choman", expect: [/Zagros|Visit Kurdistan/] },
  { id: "empty-car-gateway", url: "/search?mode=car&from=istanbul&to=erbil", expect: [/Nothing listed|no drive|Drive this corridor|Hertz/] },
  { id: "hike-erbil", url: "/search?mode=hiking&to=erbil", expect: [/trail|Hike|Hindren|Safeen/i] },
  { id: "fly-ebl-ist", url: "/search?mode=flights&from=erbil&to=istanbul", expect: [/Wego|Turkish|Kayak/] },
  { id: "fly-bgw-amm", url: "/search?mode=flights&from=baghdad&to=amman", expect: [/Royal Jordanian|Wego|Kayak/] },
  { id: "hotel-kirkuk", url: "/search?mode=hotels&to=kirkuk", expect: [/Kirkuk|Booking/] },
  { id: "hotel-amedi", url: "/search?mode=hotels&to=amedi", expect: [/Amedi|Booking|mesa/] },
  { id: "car-halabja", url: "/search?mode=car&from=sulaymaniyah&to=halabja", expect: [/km|Halabja|Hertz/] },
  { id: "bus-bgw", url: "/search?mode=bus&from=erbil&to=baghdad", expect: [/Garage|VIP|Obilet/] },
  { id: "care-tabriz", url: "/search?mode=medical&to=tabriz", expect: [/Imam Reza|Iran|land/] },
  { id: "care-chennai", url: "/search?mode=medical&to=chennai", expect: [/Apollo|e-Medical/] },
  { id: "weekend-dukan", url: "/search?mode=weekends&to=dukan", expect: [/Dukan|Airbnb|Booking/] },
  { id: "hike-zawita", url: "/search?mode=hiking&to=zawita", expect: [/Zawita|forest|trail/i] },
  { id: "providers", url: "/for-providers", expect: [/Search is free/, /Sponsored/, /Hiking clubs/] },
  { id: "hike-desks", url: "/search?mode=hiking&to=hawraman", expect: [/Kurdistan Outdoors|Clubs and arrangers|Commercial desks/] },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const results = [];

for (const j of journeys) {
  const errors = [];
  const onErr = (e) => errors.push(String(e));
  page.on("pageerror", onErr);
  try {
    await page.goto(`${BASE}${j.url}`, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(2000);
    const body = await page.locator("body").innerText();
    const missing = j.expect.filter((re) => !re.test(body)).map((re) => String(re));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    results.push({
      id: j.id,
      ok: missing.length === 0 && errors.length === 0 && !overflow,
      missing,
      errors,
      overflow,
      url: page.url(),
    });
  } catch (err) {
    results.push({ id: j.id, ok: false, error: String(err) });
  } finally {
    page.off("pageerror", onErr);
  }
}

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(800);
const mobileOverflow = await page.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
);
results.push({ id: "home-mobile", ok: !mobileOverflow, overflow: mobileOverflow });

await browser.close();

const failed = results.filter((r) => !r.ok);
writeFileSync("/tmp/gesht-e2e-report.json", JSON.stringify({ results, failed: failed.length }, null, 2));
console.log(JSON.stringify({ total: results.length, failed: failed.length, results }, null, 2));
if (failed.length) process.exit(2);
