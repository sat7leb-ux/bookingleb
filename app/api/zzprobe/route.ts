import { NextRequest, NextResponse } from "next/server";
import { getBookingById } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || "";
  const out: any = { id };
  try {
    const data = await getBookingById(id);
    out.found = !!data.booking;
    out.sample = data.booking ? { num: data.booking.booking_number, status: data.booking.confirmation_status } : null;
  } catch (e: any) { out.error = e.message; }
  return NextResponse.json(out);
}
