import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const eventIdHeader = request.headers.get("CALL-E-Event-Id");
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const event = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  if (!event || typeof event.id !== "string") {
    return NextResponse.json({ error: "Missing event id." }, { status: 400 });
  }
  if (eventIdHeader && eventIdHeader !== event.id) {
    return NextResponse.json({ error: "Event id mismatch." }, { status: 400 });
  }

  // CapacityLine currently polls CALL-E for display state, so the webhook is deliberately
  // side-effect free. A durable deployment can persist this event id before processing.
  return NextResponse.json({ received: true, eventId: event.id }, { status: 202 });
}
