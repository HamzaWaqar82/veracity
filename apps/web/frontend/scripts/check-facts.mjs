#!/usr/bin/env node
/**
 * check-facts.mjs — frontend copy ↔ corpus fact guardrail.
 *
 * Enforces the two-channel content model (see ../../DECISIONS.md, D-001):
 * the page is a NON-CONTRADICTING SUBSET of the corpus. Every hard fact the
 * frontend states (prices, guarantees, plan limits, compliance statutes, trial
 * terms, stats) must be grounded in apps/web/content markdown, otherwise the
 * build fails.
 *
 * Semantics per rule:
 *   - presence (default): frontend patterns ANY-match → rule is ACTIVE; the
 *     corpus patterns must then ALL be found in the listed corpus files.
 *   - subset:            every value extracted from the frontend (capture
 *     group of `extract`) must exist in the values extracted from the corpus.
 *     Catches value drift (e.g. a price changing on the page).
 *
 * Zero dependencies. Run via `npm run check:facts` (gates `build`).
 */
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = path.join(import.meta.dirname, "..", "src");
const CONTENT_ROOT = path.join(import.meta.dirname, "..", "..", "content");

// --- Fact registry -------------------------------------------------------

const RULES = [
  // Pricing — single source of truth is the pricing table
  // (subset: every price the page states must exist in the corpus)
  {
    id: "prices",
    type: "subset",
    files: ["pages/pricing.md"],
    extract: /\$\s?(\d+)/,
  },
  {
    id: "trial-duration",
    files: ["pages/pricing.md"],
    corpus: [/fourteen[\s-]?day free trial|14[\s-]?day free trial/i],
    frontend: [/14[\s-]?day/i, /fourteen[\s-]?day/i],
  },
  {
    id: "no-credit-card",
    files: ["pages/pricing.md"],
    corpus: [/no credit card/i],
    frontend: [/no credit card/i],
  },
  {
    id: "no-seat-minimum",
    files: ["pages/pricing.md"],
    corpus: [/no minimum seat/i],
    frontend: [/no seat minimum/i],
  },
  {
    id: "user-limit-label",
    files: ["pages/pricing.md"],
    corpus: [/user limit/i],
    frontend: [/user limit/i],
  },
  {
    id: "unlimited",
    files: ["pages/pricing.md"],
    corpus: [/\bunlimited\b/i],
    frontend: [/\bunlimited\b/i],
  },
  {
    id: "screenshot-intervals",
    files: ["pages/pricing.md"],
    corpus: [/10[\s-]?minute interval/i, /1[\u2013-]60 min/i],
    frontend: [/10[\s-]?min interval/i, /1[\u2013-]60 min/i],
  },
  {
    id: "api-limits",
    type: "subset",
    files: ["pages/pricing.md"],
    extract: /\b([\d,]{2,})\s*(?:requests? per hour|req)\b/i,
  },
  {
    id: "benchmark-cells",
    files: ["pages/pricing.md"],
    corpus: [/team benchmarking \(aggregate\)/i, /team benchmarking \(identifiable/i],
    frontend: [/aggregate only/i, /aggregate or identifiable/i],
  },
  {
    id: "support-cells",
    files: ["pages/pricing.md"],
    corpus: [/within 1 business day/i, /within 4 hours/i, /24\/7/i],
    frontend: [/1 business day/i, /4 hours/i, /24\/7/i],
  },
  {
    id: "sso",
    files: ["pages/pricing.md"],
    corpus: [/SSO \/ SAML 2\.0/i],
    frontend: [/SSO \/ SAML 2\.0/i],
  },
  {
    id: "custom-retention",
    files: ["pages/pricing.md"],
    corpus: [/custom data retention/i],
    frontend: [/custom data retention/i],
  },
  {
    id: "compliance-reports",
    files: ["pages/pricing.md"],
    corpus: [/compliance reports/i],
    frontend: [/compliance reports/i],
  },

  // Capture scope & mechanics
  {
    id: "heartbeat",
    files: ["pages/pricing.md", "pages/home.md"],
    corpus: [/60s heartbeat|60[\s-]?second heartbeat|sixty[\s-]?second heartbeat/i],
    frontend: [/60s heartbeat|60[\s-]?second|sixty[\s-]?second/i],
  },
  {
    id: "idle-threshold",
    files: ["pages/features.md", "faq/faq.md"],
    corpus: [/180[\s-]?seconds?/i],
    frontend: [/180[\s-]?seconds?/i],
  },
  {
    id: "capture-scope",
    files: ["pages/home.md", "pages/features.md"],
    corpus: [/application names?/i, /window titles?/i, /URL domains?/i],
    frontend: [/application names?/i, /window titles?/i, /URL domains?/i],
  },
  {
    id: "client-redaction",
    files: ["pages/pricing.md", "pages/home.md", "pages/features.md"],
    corpus: [/client[\s-]?side redaction|redacted client[\s-]?side/i],
    frontend: [/client[\s-]?side redaction|redacted client[\s-]?side/i],
  },
  {
    id: "sensitive-apps",
    files: ["pages/home.md", "pages/features.md"],
    corpus: [/password managers and banking/i],
    frontend: [/password managers and banking/i],
  },
  {
    id: "private-time",
    files: ["pages/home.md", "pages/features.md"],
    corpus: [/session duration/i],
    frontend: [/session duration/i],
  },
  {
    id: "os-support",
    files: ["pages/home.md", "faq/faq.md"],
    corpus: [/Windows 10 and 11/i, /Ventura/i, /Ubuntu 22\.04/i],
    frontend: [/Windows 10 and 11/i, /Ventura/i, /Ubuntu 22\.04/i],
  },

  // Compliance & security
  {
    id: "compliance-statutes",
    files: ["pages/compliance.md"],
    corpus: [/GDPR/i, /AI Act/i, /31[\s-]?48d/i, /52[\s-]?c/i],
    frontend: [/GDPR/i, /AI Act/i, /31[\s-]?48d/i, /52[\s-]?c/i],
  },
  {
    id: "tls-13",
    files: ["pages/compliance.md"],
    corpus: [/TLS 1\.3/i],
    frontend: [/TLS 1\.3/i],
  },
  {
    id: "aes-256",
    files: ["pages/compliance.md"],
    corpus: [/AES[\s-]?256/i],
    frontend: [/AES[\s-]?256/i],
  },
  {
    id: "never-captures",
    files: ["pages/pricing.md", "pages/home.md"],
    corpus: [/keystroke/i, /stealth/i, /continuous video|screen recording/i, /emotion|biometric/i, /audio|webcam|microphone/i],
    frontend: [/keystroke/i, /stealth/i, /continuous/i, /emotion/i, /biometric/i, /audio/i, /video/i, /webcam/i, /microphone/i],
  },

  // Fit, proof, stats
  {
    id: "smb-fit",
    files: ["pages/home.md", "pages/about.md", "pages/why-veracity.md", "faq/faq.md"],
    corpus: [/10 to 200 employees|10[\u2013-]200 employees/i],
    frontend: [/10 to 200 employees|10[\u2013-]200 employees/i],
  },
  {
    id: "case-study-stats",
    files: ["pages/case-studies.md"],
    corpus: [/60%/, /95%/, /100%/],
    frontend: [/60%/, /95%/, /100%/],
  },
];

// --- Runner --------------------------------------------------------------

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx?|m?js)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function extractValues(re, text) {
  const values = new Set();
  const g = new RegExp(re.source, "gi");
  let m;
  while ((m = g.exec(text)) !== null) {
    values.add(String(m[1] ?? m[0]).trim());
  }
  return values;
}

let failures = 0;
const frontendText = walk(FRONTEND_ROOT).map(read).join("\n");

for (const rule of RULES) {
  const corpusText = rule.files.map((rel) => read(path.join(CONTENT_ROOT, rel))).join("\n");
  const label = rule.files.map((f) => f.split("/").pop()).join(", ");

  if (rule.type === "subset") {
    const frontendValues = extractValues(rule.extract, frontendText);
    const corpusValues = extractValues(rule.extract, corpusText);
    const bad = [...frontendValues].filter((v) => !corpusValues.has(v));
    if (bad.length) {
      failures += 1;
      console.error(
        `[check-facts] FAIL ${rule.id}: page states a value not grounded in the corpus (${label}):\n` +
          bad.map((v) => `  - not in corpus: "${v}"`).join("\n"),
      );
    } else {
      console.log(`[check-facts] ok ${rule.id}`);
    }
    continue;
  }

  const missing = [];
  for (const re of rule.corpus) {
    if (!re.test(corpusText)) missing.push(`${label} ~ ${re}`);
  }
  const active = rule.frontend.some((re) => re.test(frontendText));
  if (active && missing.length) {
    failures += 1;
    console.error(
      `[check-facts] FAIL ${rule.id}: the page states a fact not grounded in the corpus:\n` +
        missing.map((m) => `  - not found: ${m}`).join("\n"),
    );
  } else {
    console.log(`[check-facts] ok ${rule.id}`);
  }
}

if (failures) {
  console.error(`[check-facts] ${failures} fact(s) ungrounded — fix the copy or ground the fact in the corpus.`);
  process.exit(1);
}
console.log("[check-facts] all frontend facts are grounded in the corpus.");
