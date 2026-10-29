#!/usr/bin/env node
/**
 * lighthouse.mjs — Lighthouse measurement harness for the Veracity website.
 *
 * Audits every public route at both mobile and desktop viewports against a
 * LOCAL PRODUCTION BUILD (`next start`), records per-route raw JSON, writes a
 * compact committed summary (scores + LCP/TBT/CLS + a11y failures), and gates
 * the run: Performance and Accessibility must be >= `--fail-below` (default 90)
 * on every route × viewport, or the process exits non-zero.
 *
 * This closes NFR-PERF-2 (#29), NFR-A11Y-1 (#30) and NFR-A11Y-2 (#31) with
 * reproducible evidence. No deployment is required — Lighthouse audits whatever
 * URL it is given; `next start` on a fixed local port is enough.
 *
 * Requires: a production build (run `npm run build` first, with `next dev`
 * STOPPED — dev and build share `.next`, see apps/web/AGENTS.md). Chromium is
 * located via LH_CHROME_PATH (default /usr/bin/chromium).
 *
 * Usage (from apps/web/frontend):
 *   npm run lighthouse:report                          full 36-audit sweep
 *   npm run lighthouse:report -- --only /pricing       one route
 *   npm run lighthouse:report -- --viewport mobile     one viewport
 *   npm run lighthouse:report -- --ts verification     name the run (summary-<ts>)
 *   npm run lighthouse:report -- --fail-below 90       gate threshold (default 90)
 *
 * Environment:
 *   LH_PORT          prod server port (default 3137)
 *   LH_CHROME_PATH   chromium binary (default /usr/bin/chromium)
 *   LH_CHROME_FLAGS  extra chrome flags (default "--headless=new --no-sandbox --disable-gpu")
 *
 * Zero runtime dependencies beyond the `lighthouse` devDependency.
 */
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// --- Paths ----------------------------------------------------------------

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND = path.join(SCRIPT_DIR, "..");
const LIGHTHOUSE_BIN = path.join(FRONTEND, "node_modules", ".bin", "lighthouse");
const LH_DIR = path.join(FRONTEND, "..", "lighthouse");
const RAW_DIR = path.join(LH_DIR, "raw");

// --- Routes (mirror of src/app/sitemap.ts + the 3 /resources essays) ------

const STATIC_ROUTES = [
  "/",
  "/features",
  "/pricing",
  "/why-veracity",
  "/resources",
  "/about",
  "/faq",
  "/case-studies",
  "/integrations",
  "/compliance",
  "/contact-us",
  "/privacy",
  "/terms",
  "/trial",
  "/request-demo",
];
const ESSAY_ROUTES = [
  "/resources/how-productivity-scoring-works",
  "/resources/transparent-monitoring-for-modern-teams",
  "/resources/smb-guide-to-workforce-analytics",
];
const ROUTES = [...STATIC_ROUTES, ...ESSAY_ROUTES];
const VIEWPORTS = ["mobile", "desktop"];

// --- Config ---------------------------------------------------------------

const PORT = Number(process.env.LH_PORT ?? 3137);
const CHROME_PATH = process.env.LH_CHROME_PATH ?? "/usr/bin/chromium";
const CHROME_FLAGS = process.env.LH_CHROME_FLAGS ?? "--headless=new --no-sandbox --disable-gpu";
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ONLY_CATEGORIES = "performance,accessibility,best-practices,seo";

// --- CLI arg parsing (zero-dep) ------------------------------------------

const args = process.argv.slice(2);
function argValue(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const help = args.includes("--help") || args.includes("-h");
const onlyRoutes = args
  .map((a, i) => (a === "--only" ? args[i + 1] : null))
  .filter(Boolean)
  .filter((r, i, arr) => arr.indexOf(r) === i);
const viewportFilter = argValue("--viewport", "both");
const ts = argValue("--ts", new Date().toISOString().replace(/[-:.T]/g, "").replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\d+/, "$1$2$3T$4$5$6Z"));
const failBelow = Number(argValue("--fail-below", "90"));

if (help) {
  console.log(`Lighthouse harness — Veracity website
  --only <route>      audit a single route (repeatable; e.g. --only /pricing)
  --viewport <m|d>    mobile | desktop | both (default both)
  --ts <label>        run id used in output filenames (default UTC timestamp)
  --fail-below <n>    gate threshold (default 90)
  Env: LH_PORT, LH_CHROME_PATH, LH_CHROME_FLAGS`);
  process.exit(0);
}

if (!["mobile", "desktop", "both"].includes(viewportFilter)) {
  console.error(`Unknown --viewport "${viewportFilter}" (mobile | desktop | both)`);
  process.exit(1);
}
const viewports = VIEWPORTS.filter((v) => viewportFilter === "both" || v === viewportFilter);
const routes = onlyRoutes.length ? ROUTES.filter((r) => onlyRoutes.includes(r)) : ROUTES;
if (onlyRoutes.length) {
  const unknown = onlyRoutes.filter((r) => !ROUTES.includes(r));
  if (unknown.length) {
    console.error(`Unknown route(s): ${unknown.join(", ")}. Known routes:\n  ${ROUTES.join("\n  ")}`);
    process.exit(1);
  }
}

// --- Helpers --------------------------------------------------------------

function routeFile(route) {
  const s = route.replace(/^\//, "").replace(/[/?&#]/g, "-");
  return s || "index";
}

function fmtPct(score) {
  return score === null || score === undefined ? "-" : Math.round(score * 100);
}

function fmtMs(n) {
  return n === null || n === undefined ? "-" : `${Math.round(n)}ms`;
}

function portInUse(port) {
  try {
    execFileSync("bash", ["-c", `(echo > /dev/tcp/127.0.0.1/${port}) >/dev/null 2>&1`]);
    return true;
  } catch {
    return false;
  }
}

function waitForServer(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const tick = async () => {
      if (Date.now() > deadline) return reject(new Error(`server not ready at ${url} within ${timeoutMs}ms`));
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {}
      setTimeout(tick, 500);
    };
    tick();
  });
}

function runLighthouse(route, viewport) {
  const outFile = path.join(RAW_DIR, ts, `${routeFile(route)}--${viewport}.report.json`);
  const flags = [
    BASE_URL + route,
    `--output=json`,
    `--output-path=${outFile}`,
    `--only-categories=${ONLY_CATEGORIES}`,
    `--chrome-path=${CHROME_PATH}`,
    `--chrome-flags=${CHROME_FLAGS}`,
    `--max-wait-for-load=60000`,
    `--quiet`,
  ];
  if (viewport === "desktop") flags.push("--preset=desktop");
  return new Promise((resolve) => {
    const child = spawn(LIGHTHOUSE_BIN, flags, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d));
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve({ ok: false, error: `lighthouse timed out after 180s\n${stderr.slice(-2000)}` });
    }, 180_000);
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ ok: false, error: String(err) });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) return resolve({ ok: false, error: `lighthouse exit ${code}\n${stderr.slice(-2000)}` });
      try {
        const report = JSON.parse(fs.readFileSync(outFile, "utf8"));
        resolve({ ok: true, report });
      } catch (err) {
        resolve({ ok: false, error: `could not parse ${outFile}: ${err}` });
      }
    });
  });
}

function extractSummary(report) {
  const cats = report.categories ?? {};
  const audits = report.audits ?? {};
  const lcp = audits["largest-contentful-paint"];
  const tbt = audits["total-blocking-time"];
  const cls = audits["cumulative-layout-shift"];
  const a11yFailures = [];
  const a11yRefs = (cats.accessibility?.auditRefs ?? []);
  for (const ref of a11yRefs) {
    const audit = audits[ref.id];
    if (audit && typeof audit.score === "number" && audit.score < 1 && (audit.weight ?? 0) > 0) {
      a11yFailures.push({ id: ref.id, title: audit.title });
    }
  }
  return {
    scores: {
      performance: cats.performance?.score ?? null,
      accessibility: cats.accessibility?.score ?? null,
      best_practices: cats["best-practices"]?.score ?? null,
      seo: cats.seo?.score ?? null,
    },
    metrics: {
      lcp_ms: lcp?.numericValue ?? null,
      tbt_ms: tbt?.numericValue ?? null,
      cls: cls?.numericValue ?? null,
    },
    a11y_failures: a11yFailures,
  };
}

// --- Summary rendering ----------------------------------------------------

function renderSummary(run) {
  const lines = [];
  lines.push(`# Lighthouse Report — ${run.run_id}`);
  lines.push("");
  lines.push(`- Generated: ${run.generated_at}`);
  lines.push(`- Chrome: ${run.chrome}`);
  lines.push(`- Viewports: ${run.viewports.join(", ")} — mobile uses Lighthouse simulated 4G throttling; desktop uses the desktop preset (no throttling).`);
  lines.push(`- Gate: Performance & Accessibility >= ${run.fail_below} on every route × viewport.`);
  lines.push(`- Method: local production build via \`next start\` (no deployment required). Raw JSON in \`lighthouse/raw/\` (gitignored).`);
  lines.push("");
  lines.push(`**Gate result: ${run.gate_pass ? "PASS" : "FAIL"}** (${run.passed}/${run.total} route×viewport audits meet the threshold)`);
  lines.push("");
  for (const vp of run.viewports) {
    lines.push(`## ${vp === "mobile" ? "Mobile" : "Desktop"}`);
    lines.push("");
    lines.push("| Route | Perf | A11y | BP | SEO | LCP | TBT | CLS |");
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
    for (const row of run.rows.filter((r) => r.viewport === vp)) {
      const s = row.scores ?? {};
      const m = row.metrics ?? {};
      const mark = (v) => {
        if (v === null || v === undefined) return "-";
        const n = Math.round(v * 100);
        return n >= run.fail_below ? `**${n}**` : `**${n} ⚠**`;
      };
      lines.push(
        `| ${row.route} | ${mark(s.performance)} | ${mark(s.accessibility)} | ${fmtPct(s.best_practices)} | ${fmtPct(s.seo)} | ${fmtMs(m.lcp_ms)} | ${fmtMs(m.tbt_ms)} | ${m.cls === null || m.cls === undefined ? "-" : m.cls.toFixed(3)} |`
      );
    }
    lines.push("");
  }
  const failures = run.rows.flatMap((r) => r.a11y_failures.map((f) => ({ ...f, route: r.route, viewport: r.viewport })));
  if (failures.length) {
    const counts = new Map();
    for (const f of failures) counts.set(f.id, (counts.get(f.id) ?? 0) + 1);
    lines.push("## Accessibility failures surfaced by axe");
    lines.push("");
    lines.push("| Audit | Title | Occurrences |");
    lines.push("| --- | --- | ---: |");
    for (const [id, n] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
      const title = failures.find((f) => f.id === id).title;
      lines.push(`| \`${id}\` | ${title} | ${n} |`);
    }
    lines.push("");
    lines.push("Detail by page:");
    for (const f of failures) lines.push(`- ${f.route} (${f.viewport}): \`${f.id}\` — ${f.title}`);
    lines.push("");
  }
  return lines.join("\n");
}

// --- Preflight ------------------------------------------------------------

if (!fs.existsSync(LIGHTHOUSE_BIN)) {
  console.error(`lighthouse binary not found at ${LIGHTHOUSE_BIN}. Run: npm install --save-dev lighthouse`);
  process.exit(1);
}
if (!fs.existsSync(CHROME_PATH)) {
  console.error(`Chromium not found at ${CHROME_PATH}. Install it or set LH_CHROME_PATH.`);
  process.exit(1);
}
if (portInUse(PORT)) {
  console.error(`Port ${PORT} is already in use — something else is listening. Stop it or set LH_PORT.`);
  process.exit(1);
}
if (portInUse(3000)) {
  console.error(
    "A dev server is running on :3000 (next dev). Stop it before this harness: the production\n" +
      "build shares .next and `next start` needs a build that dev has not overwritten.\n" +
      "  npm run build  (with dev stopped)  →  npm run lighthouse:report"
  );
  process.exit(1);
}

// --- Main -----------------------------------------------------------------

const run = {
  run_id: ts,
  generated_at: new Date().toISOString(),
  chrome: CHROME_PATH,
  viewports,
  fail_below: failBelow,
  rows: [],
  passed: 0,
  total: routes.length * viewports.length,
  gate_pass: false,
};

fs.mkdirSync(path.join(RAW_DIR, ts), { recursive: true });
fs.mkdirSync(LH_DIR, { recursive: true });

console.log(`Starting production server on :${PORT} …`);
const server = spawn("npm", ["run", "start", "--", "-p", String(PORT)], {
  cwd: FRONTEND,
  stdio: ["ignore", "pipe", "pipe"],
});
let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));

const cleanup = () => {
  if (server && !server.killed) server.kill("SIGTERM");
};
process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});

try {
  await waitForServer(BASE_URL + "/", 60_000);
  console.log(`Server up. Auditing ${run.total} route×viewport combinations (${routes.length} routes).`);
} catch (err) {
  console.error(`Server failed to start:\n${serverLog.slice(-3000)}`);
  cleanup();
  process.exit(1);
}

let completed = 0;
for (const route of routes) {
  for (const viewport of viewports) {
    completed += 1;
    process.stdout.write(`[${completed}/${run.total}] ${viewport} ${route} … `);
    const res = await runLighthouse(route, viewport);
    if (!res.ok) {
      console.log(`ERROR`);
      console.error(`  ${res.error}`);
      run.rows.push({ route, viewport, error: res.error });
      continue;
    }
    const sum = extractSummary(res.report);
    run.rows.push({ route, viewport, ...sum });
    const p = Math.round(sum.scores.performance * 100);
    const a = Math.round(sum.scores.accessibility * 100);
    console.log(`perf ${p} · a11y ${a}`);
    try {
      const partial = { ...run, rows: run.rows, generated_at: run.generated_at };
      fs.writeFileSync(path.join(LH_DIR, `summary-${ts}.json`), JSON.stringify(partial, null, 2));
      fs.writeFileSync(path.join(LH_DIR, `summary-${ts}.md`), renderSummary(partial));
    } catch {}
  }
}

run.gate_pass = run.rows.every(
  (r) =>
    r.error === undefined &&
    r.scores.performance !== null &&
    r.scores.performance * 100 >= failBelow &&
    r.scores.accessibility !== null &&
    r.scores.accessibility * 100 >= failBelow
);
run.passed = run.rows.filter(
  (r) => r.error === undefined && r.scores.performance !== null && r.scores.performance * 100 >= failBelow && r.scores.accessibility !== null && r.scores.accessibility * 100 >= failBelow
).length;

fs.writeFileSync(path.join(LH_DIR, `summary-${ts}.json`), JSON.stringify(run, null, 2));
fs.writeFileSync(path.join(LH_DIR, `summary-${ts}.md`), renderSummary(run));

cleanup();
console.log("");
console.log(`Summary: apps/web/lighthouse/summary-${ts}.json (+ .md)`);
console.log(`Gate: ${run.gate_pass ? "PASS" : "FAIL"} — ${run.passed}/${run.total} route×viewport audits >= ${failBelow}`);
if (!run.gate_pass) {
  console.log("Failing rows:");
  for (const r of run.rows) {
    if (r.error) console.log(`  - ${r.route} (${r.viewport}): ${r.error}`);
    else if ((r.scores.performance ?? 0) * 100 < failBelow || (r.scores.accessibility ?? 0) * 100 < failBelow)
      console.log(`  - ${r.route} (${r.viewport}): perf ${fmtPct(r.scores.performance)} a11y ${fmtPct(r.scores.accessibility)}`);
  }
  process.exit(1);
}
