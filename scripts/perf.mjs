// Performance profile of the home page on constrained devices. Not part of
// CI (the numbers are noisy); run it before and after a change and compare.
//
//   bun run build && bun run start --port 3140     (outside the sandbox)
//   bun run perf -- --out /tmp/perf-before          (in another shell)
//
// Options: --url (default http://localhost:3140), --out (default perf-report),
// --runs (default 3, medians are reported), --only <scenario,...>,
// --headed (a visible window), --css "<rules>" (inject CSS after load, to
// try a style change without rebuilding), --cpu <rate> (override every
// scenario's CPU throttling).
//
// Each scenario loads the page in Google Chrome (or Playwright's Chromium)
// with CPU and network throttling and records:
//   load     LCP, CLS, total blocking time, longest task, bytes by type,
//            WebGL contexts created and the halftone modes 5 s after load;
//   runtime  frame intervals while the hero idles, during a scripted scroll
//            through the 48-hour replay and while the close section idles,
//            plus main-thread time (script, style, layout) spent in that
//            scroll and the composited layers on screen mid-replay.
//
// Lighthouse is separate:
//   CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
//     bunx lighthouse http://localhost:3140 --preset=perf --form-factor=mobile \
//     --output=json --output-path=<dir>/lh.json --chrome-flags=--headless=new
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { chromium } from "@playwright/test";

const { values: args } = parseArgs({
  options: {
    url: { type: "string", default: "http://localhost:3140" },
    out: { type: "string", default: "perf-report" },
    runs: { type: "string", default: "3" },
    only: { type: "string" },
    headed: { type: "boolean", default: false },
    css: { type: "string" },
    cpu: { type: "string" },
  },
});

/** Lighthouse's mobile network: 150 ms RTT, 1.6 Mbps down, 750 kbps up. */
const SLOW_4G = { latency: 150, downloadThroughput: 200_000, uploadThroughput: 94_000 };
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true };
const SCENARIOS = [
  { name: "phone-cpu4x", context: PHONE, cpu: 4, network: SLOW_4G },
  { name: "phone-cpu6x", context: PHONE, cpu: 6, network: SLOW_4G },
  {
    // A weak GPU: SwiftShader (on the CPU) chosen as the GPU, so WebGL runs
    // without a performance caveat and compositing is slow.
    name: "phone-software-gl",
    context: PHONE,
    cpu: 4,
    network: SLOW_4G,
    launchArgs: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  },
  {
    // A blocked GPU: Chrome falls back to software WebGL and flags it with
    // a major performance caveat.
    name: "phone-blocked-gpu",
    context: PHONE,
    cpu: 4,
    network: SLOW_4G,
    launchArgs: ["--disable-gpu", "--enable-unsafe-swiftshader"],
  },
  {
    name: "desktop",
    context: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
    cpu: 1,
    network: null,
  },
];

/** Runs in the page before any of its scripts. */
function instrument() {
  const perf = { lcp: 0, cls: 0, longTasks: [], contexts: [], fcp: 0 };
  window.__perf = perf;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) perf.lcp = entry.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) if (!entry.hadRecentInput) perf.cls += entry.value;
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries())
      perf.longTasks.push({ start: entry.startTime, duration: entry.duration });
  }).observe({ type: "longtask", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries())
      if (entry.name === "first-contentful-paint") perf.fcp = entry.startTime;
  }).observe({ type: "paint", buffered: true });
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const context = getContext.call(this, type, ...rest);
    if (type === "webgl2" || type === "webgl") {
      let renderer = null;
      if (context) {
        const info = context.getExtension("WEBGL_debug_renderer_info");
        renderer = info ? context.getParameter(info.UNMASKED_RENDERER_WEBGL) : null;
      }
      perf.contexts.push({ at: performance.now(), ok: Boolean(context), renderer });
    }
    return context;
  };
}

/**
 * Frame intervals (ms) for `ms` milliseconds, optionally while scrolling.
 * While scrolling, the last interval slot holds the count of scroll events
 * as a negative number (see `scrollEvents`), a check that the page moved.
 */
function recordFrames({ ms, scroll }) {
  return new Promise((resolve) => {
    const times = [];
    let events = 0;
    const count = () => (events += 1);
    if (scroll) window.addEventListener("scroll", count, { passive: true });
    const finish = () => {
      window.removeEventListener("scroll", count);
      const intervals = times.slice(1).map((time, i) => time - times[i]);
      resolve(scroll ? [...intervals, -events] : intervals);
    };
    const t0 = performance.now();
    const step = (now) => {
      times.push(now);
      const t = (now - t0) / ms;
      // Instant: the page sets `scroll-behavior: smooth`, and a smooth scroll
      // restarted every frame barely moves.
      if (scroll)
        window.scrollTo({
          top: scroll.from + (scroll.to - scroll.from) * Math.min(1, t),
          behavior: "instant",
        });
      if (t < 1) requestAnimationFrame(step);
      else finish();
    };
    requestAnimationFrame(step);
  });
}

const quantile = (values, q) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
};
const median = (values) =>
  quantile(
    values.filter((v) => v !== null),
    0.5,
  );
const round = (value, digits = 1) =>
  value === null || value === undefined ? null : Number(value.toFixed(digits));

function frameStats(recorded) {
  const intervals = recorded.filter((v) => v >= 0);
  const events = recorded.find((v) => v < 0);
  return {
    scrollEvents: events === undefined ? null : -events,
    fps: round(1000 / (intervals.reduce((a, b) => a + b, 0) / intervals.length)),
    p50: round(quantile(intervals, 0.5)),
    p95: round(quantile(intervals, 0.95)),
    slowPct: round((100 * intervals.filter((v) => v > 25).length) / intervals.length),
  };
}

async function metrics(cdp) {
  const { metrics: list } = await cdp.send("Performance.getMetrics");
  return Object.fromEntries(list.map((m) => [m.name, m.value]));
}

async function runOnce(browser, scenario) {
  const context = await browser.newContext({ ...scenario.context });
  await context.addInitScript(instrument);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Performance.enable");
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  if (scenario.network)
    await cdp.send("Network.emulateNetworkConditions", { offline: false, ...scenario.network });
  await cdp.send("Emulation.setCPUThrottlingRate", {
    rate: args.cpu ? Number(args.cpu) : scenario.cpu,
  });

  await page.goto(args.url, { waitUntil: "load", timeout: 120_000 });
  if (args.css) await page.addStyleTag({ content: args.css });
  await page.waitForTimeout(5000);

  const load = await page.evaluate(() => {
    const perf = window.__perf;
    const bytes = {};
    for (const entry of performance.getEntriesByType("resource")) {
      const ext = entry.name.split("?")[0].split(".").pop();
      const kind = entry.name.includes("/_next/image")
        ? "image"
        : { js: "js", css: "css", woff2: "font", svg: "image", webp: "image" }[ext] || "other";
      bytes[kind] = (bytes[kind] || 0) + entry.transferSize;
    }
    const nav = performance.getEntriesByType("navigation")[0];
    bytes.html = nav?.transferSize ?? 0;
    const blocking = perf.longTasks
      .filter((task) => task.start >= perf.fcp)
      .reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0);
    return {
      fcp: perf.fcp,
      lcp: perf.lcp,
      cls: perf.cls,
      tbt: blocking,
      longestTask: Math.max(0, ...perf.longTasks.map((task) => task.duration)),
      kb: Object.fromEntries(Object.entries(bytes).map(([k, v]) => [k, Math.round(v / 1024)])),
      contexts: perf.contexts.length,
      contextsOk: perf.contexts.filter((c) => c.ok).length,
      renderer: perf.contexts.find((c) => c.renderer)?.renderer ?? null,
      modes: [...document.querySelectorAll("[data-halftone]")].map((el) => el.dataset.halftone),
    };
  });

  // Runtime: no network throttling, the page is loaded.
  if (scenario.network)
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1,
    });
  const hero = frameStats(await page.evaluate(recordFrames, { ms: 4000 }));

  const replay = await page.evaluate(() => {
    const el = document.querySelector(".replay");
    const top = el.getBoundingClientRect().top + window.scrollY;
    return { from: top - window.innerHeight, to: top + el.offsetHeight };
  });
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), replay.from);
  await page.waitForTimeout(1500);
  const before = await metrics(cdp);
  const scroll = frameStats(await page.evaluate(recordFrames, { ms: 8000, scroll: replay }));
  const after = await metrics(cdp);
  const main = Object.fromEntries(
    ["ScriptDuration", "RecalcStyleDuration", "LayoutDuration", "TaskDuration"].map((key) => [
      key.replace("Duration", "").toLowerCase(),
      Math.round((after[key] - before[key]) * 1000),
    ]),
  );

  // Composited layers mid-replay.
  await page.evaluate(
    (r) => window.scrollTo({ top: (r.from + r.to) / 2, behavior: "instant" }),
    replay,
  );
  await cdp.send("LayerTree.enable");
  let layers = [];
  cdp.on("LayerTree.layerTreeDidChange", (event) => (layers = event.layers ?? layers));
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollBy({ top: 1, behavior: "instant" }));
  await page.waitForTimeout(800);
  await cdp.send("LayerTree.disable");
  const drawn = layers.filter((layer) => layer.drawsContent);
  const dpr = scenario.context.deviceScaleFactor ?? 1;
  const layerMb = round(
    (drawn.reduce((sum, layer) => sum + layer.width * layer.height, 0) * 4 * dpr * dpr) / 2 ** 20,
    0,
  );

  await page.evaluate(() =>
    document
      .querySelector("#close-title")
      ?.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await page.waitForTimeout(3500);
  const close = frameStats(await page.evaluate(recordFrames, { ms: 3000 }));
  const final = await page.evaluate(() => ({
    modes: [...document.querySelectorAll("[data-halftone]")].map((el) => el.dataset.halftone),
    // The kit's adaptive quality: the renderer's level per field (0 is full)
    // and whether the page switched to reduced effects.
    quality: [...document.querySelectorAll("[data-halftone] canvas")].map(
      (el) => el.dataset.quality ?? "-",
    ),
    effects: document.documentElement.dataset.effects ?? "full",
    contexts: window.__perf.contexts.length,
  }));
  const heap = Math.round((await metrics(cdp)).JSHeapUsedSize / 2 ** 20);

  await context.close();
  return {
    load,
    hero,
    scroll,
    main,
    layers: { count: drawn.length, mb: layerMb },
    close,
    final,
    heapMb: heap,
  };
}

/** Median of every numeric leaf across runs; other leaves come from the first run. */
function combine(runs) {
  const walk = (values) => {
    const first = values[0];
    if (typeof first === "number") return round(median(values), 3);
    if (first && typeof first === "object" && !Array.isArray(first))
      return Object.fromEntries(
        Object.keys(first).map((key) => [key, walk(values.map((value) => value?.[key]))]),
      );
    return first;
  };
  return walk(runs);
}

function table(results) {
  const rows = [
    ["LCP ms", (r) => round(r.load.lcp, 0)],
    ["FCP ms", (r) => round(r.load.fcp, 0)],
    ["CLS", (r) => round(r.load.cls, 3)],
    ["TBT ms", (r) => round(r.load.tbt, 0)],
    ["Longest task ms", (r) => round(r.load.longestTask, 0)],
    ["JS KB", (r) => r.load.kb.js],
    ["CSS KB", (r) => r.load.kb.css],
    ["Font KB", (r) => r.load.kb.font],
    ["WebGL contexts 5 s after load", (r) => r.load.contexts],
    ["Halftone modes after load", (r) => r.load.modes.join(" ")],
    ["Hero fps / p95 ms / slow %", (r) => `${r.hero.fps} / ${r.hero.p95} / ${r.hero.slowPct}`],
    [
      "Replay scroll fps / p95 ms / slow %",
      (r) => `${r.scroll.fps} / ${r.scroll.p95} / ${r.scroll.slowPct}`,
    ],
    ["Replay scroll events (sanity)", (r) => r.scroll.scrollEvents],
    [
      "Replay main thread ms (script/style/layout)",
      (r) => `${r.main.script} / ${r.main.recalcstyle} / ${r.main.layout}`,
    ],
    ["Layers mid-replay (count / MB)", (r) => `${r.layers.count} / ${r.layers.mb}`],
    ["Close fps / p95 ms", (r) => `${r.close.fps} / ${r.close.p95}`],
    ["Halftone modes at end", (r) => r.final.modes.join(" ")],
    ["Halftone quality levels at end", (r) => r.final.quality?.join(" ") ?? "-"],
    ["Effects at end", (r) => r.final.effects ?? "-"],
    ["JS heap MB", (r) => r.heapMb],
  ];
  const names = Object.keys(results);
  const lines = [
    `| Metric | ${names.join(" | ")} |`,
    `| --- | ${names.map(() => "---").join(" | ")} |`,
    ...rows.map(
      ([label, get]) => `| ${label} | ${names.map((n) => get(results[n])).join(" | ")} |`,
    ),
  ];
  return lines.join("\n");
}

const runs = Number(args.runs);
const only = args.only?.split(",");
const results = {};
const raw = {};
for (const scenario of SCENARIOS.filter((s) => !only || only.includes(s.name))) {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: !args.headed,
    args: scenario.launchArgs ?? [],
  });
  raw[scenario.name] = [];
  for (let i = 0; i < runs; i += 1) {
    process.stdout.write(`${scenario.name} run ${i + 1}/${runs}\n`);
    raw[scenario.name].push(await runOnce(browser, scenario));
  }
  await browser.close();
  results[scenario.name] = combine(raw[scenario.name]);
}

mkdirSync(args.out, { recursive: true });
writeFileSync(join(args.out, "perf.json"), `${JSON.stringify({ results, raw }, null, 2)}\n`);
const markdown = table(results);
writeFileSync(join(args.out, "perf.md"), `${markdown}\n`);
process.stdout.write(`${markdown}\n`);
