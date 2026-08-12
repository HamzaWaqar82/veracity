import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\\s@]+@[^\\s@]+\.[^\\s@]+$/;
const MAX_LEN = 2000;
const BACKEND_URL = (process.env.VERACITY_BACKEND_URL ?? "").replace(/\/+$/, "");
const LOCAL_DEV_URL = process.env.NODE_ENV !== "production" ? "http://localhost:8000" : "";
const upstreamBase = BACKEND_URL || LOCAL_DEV_URL;

type LeadBody = {
  kind?: unknown;
  name?: unknown;
  email?: unknown;
  company?: unknown;
  companySize?: unknown;
  coverage?: unknown;
  preferredTime?: unknown;
  topic?: unknown;
  message?: unknown;
  notes?: unknown;
};

function clean(value: unknown, max = MAX_LEN): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  let body: LeadBody;
  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const kind = clean(body.kind, 20);
  if (!["contact", "demo", "trial"].includes(kind)) {
    return Response.json({ error: "Unknown form type" }, { status: 400 });
  }

  const name = clean(body.name, 200);
  const email = clean(body.email, 254).toLowerCase();
  if (!name || !EMAIL_RE.test(email)) {
    return Response.json({ error: "Name and a valid email are required" }, { status: 400 });
  }

  // Proxy to the backend, which persists the lead in Postgres (survives
  // serverless redeploys — the previous local-JSONL approach lost leads).
  if (!upstreamBase) {
    return Response.json(
      { error: "Lead service is not configured. Set VERACITY_BACKEND_URL." },
      { status: 503 },
    );
  }

  const payload = {
    kind,
    name,
    email,
    company: clean(body.company, 200),
    companySize: clean(body.companySize, 50),
    coverage: clean(body.coverage, 200),
    preferredTime: clean(body.preferredTime, 200),
    topic: clean(body.topic, 100),
    message: clean(body.message),
    notes: clean(body.notes),
  };

  try {
    const upstream = await fetch(`${upstreamBase}/api/lead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": process.env.VERACITY_INTERNAL_TOKEN ?? "",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
    if (!upstream.ok) {
      return Response.json({ error: "Lead service rejected the submission" }, { status: 502 });
    }
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "Lead service unavailable" }, { status: 502 });
  }
}
