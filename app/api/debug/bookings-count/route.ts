import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await db<{ n: number }>("select count(*)::int as n from bookings");
    const recent = await db<any[]>("select id, booking_number, confirmation_status, production_date, created_at from bookings order by created_at desc limit 5");
    return NextResponse.json({ ok: true, total: count.rows[0]?.n ?? 0, recent });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
