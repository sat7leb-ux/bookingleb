import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.MIGRATION_SECRET;
  const provided = req.headers.get("x-migration-secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { rows } = await db<any[]>("select id, booking_number from bookings order by created_at asc");
    let counter = 0;
    for (const row of rows) {
      counter += 1;
      await db("update bookings set booking_number = $1 where id = $2", [
        `SAT7-2026-${String(counter).padStart(5, "0")}`,
        row.id,
      ]);
    }
    return NextResponse.json({ ok: true, updated: counter });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
