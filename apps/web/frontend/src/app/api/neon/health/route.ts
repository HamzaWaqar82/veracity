import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/neon";
import { checkStorageHealth } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const [dbStatus, storageStatus] = await Promise.all([
    checkDatabaseHealth(),
    checkStorageHealth(),
  ]);

  const allHealthy = dbStatus.ok && storageStatus.ok;

  return NextResponse.json(
    {
      ok: allHealthy,
      branch: process.env.NEON_BRANCH ?? "unknown",
      postgres: dbStatus,
      objectStorage: storageStatus,
      timestamp: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503 }
  );
}
