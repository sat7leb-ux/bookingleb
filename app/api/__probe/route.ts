import { NextRequest, NextResponse } from "next/server";
import { getBookingById } from "@/lib/queries";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || "";
  const out: any = { id };
  try {
    out.probe = (await db("select id, booking_number from bookings where id = $1", [id])).rows.length;
  } catch (e: any) { out.probeError = e.message; }
  try {
    const data = await getBookingById(id);
    out.found = !!data.booking;
    out.hasReq = !!data.requirements;
    out.hasTrans = !!data.transportation;
    out.hasDress = !!data.dress;
    out.activityCount = data.activity.length;
    out.msgCount = data.messages.length;
    out.bookingKeys = data.booking ? Object.keys(data.booking).slice(0, 20) : null;
    out.bookingSample = data.booking ? { id: data.booking.id, num: data.booking.booking_number, status: data.booking.confirmation_status, prod: typeof data.booking.production_date, call: typeof data.booking.call_time } : null;
  } catch (e: any) {
    out.error = e.message;
    out.stack = (e.stack || "").split("\n").slice(0, 5);
  }
  return NextResponse.json(out);
}
