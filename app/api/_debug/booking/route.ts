import { NextRequest, NextResponse } from "next/server";
import { getBookingById } from "@/lib/queries";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || "";
  try {
    const data = await getBookingById(id);
    return NextResponse.json({ found: !!data.booking, id, hasReq: !!data.requirements, err: null });
  } catch (e: any) {
    return NextResponse.json({ found: false, id, err: e?.message || String(e) });
  }
}
