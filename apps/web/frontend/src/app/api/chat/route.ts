import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL = (
  process.env.VERACITY_BACKEND_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export async function POST(request: NextRequest) {
  let message = "";
  let sessionId: string | null = null;

  try {
    const body = await request.json();
    message = typeof body?.message === "string" ? body.message : "";
    sessionId = typeof body?.session_id === "string" ? body.session_id : null;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!message.trim()) {
    return Response.json({ error: "message is required" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, session_id: sessionId }),
      signal: AbortSignal.timeout(180_000),
    });
  } catch {
    return Response.json({ error: "Chat service unavailable" }, { status: 502 });
  }

  if (!upstream.ok) {
    return Response.json(
      { error: `Chat service error (${upstream.status})` },
      { status: 502 }
    );
  }

  if (!upstream.body) {
    return Response.json(
      { error: "Empty response from chat service" },
      { status: 502 }
    );
  }

  const reader = upstream.body.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            controller.enqueue(encoder.encode(line + "\n"));
          }
        }
        if (buffer.trim()) {
          controller.enqueue(encoder.encode(buffer + "\n"));
        }
      } catch {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: "Stream interrupted" })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
