import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows } = await db<{ count: string }>("select count(*)::text as count from bookings");
    const { rows: bookings } = await db("select id, booking_number, production_date, confirmation_status from bookings order by id limit 10");
    return Response.json({ total: rows[0]?.count, bookings });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
