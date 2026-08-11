import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = 2000;

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

async function appendLead(record: object): Promise<boolean> {
  const line = `${JSON.stringify(record)}\n`;
  const day = new Date().toISOString().slice(0, 10);
  const dirs = [
    path.join(process.cwd(), "data", "leads"),
    path.join(os.tmpdir(), "veracity-leads"),
  ];
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.appendFile(path.join(dir, `leads-${day}.jsonl`), line, "utf8");
      return true;
    } catch {
      // Try the next writable location.
    }
  }
  return false;
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

  const record = {
    id: randomUUID(),
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
    receivedAt: new Date().toISOString(),
  };

  const stored = await appendLead(record);
  if (!stored) {
    return Response.json({ error: "Lead could not be stored" }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}
