import { neon } from "@neondatabase/serverless";

const connectionString =
  process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED || "";

export const sql = connectionString ? neon(connectionString) : null;

export type DbHealthResult = {
  ok: boolean;
  now?: string;
  version?: string;
  tables?: string[];
  error?: string;
};

export async function checkDatabaseHealth(): Promise<DbHealthResult> {
  if (!sql) {
    return { ok: false, error: "DATABASE_URL is not configured" };
  }
  try {
    const meta = await sql`SELECT NOW() as now, version() as version;`;
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    return {
      ok: true,
      now: meta[0]?.now ? String(meta[0].now) : undefined,
      version: meta[0]?.version ? String(meta[0].version) : undefined,
      tables: tables.map((r) => String(r.table_name)),
    };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
