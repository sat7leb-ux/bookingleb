import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || "";
  const out: any = { id };
  // exact main query from getBookingById
  const sql = `select b.*,
       p.full_name as person_full_name, p.whatsapp as person_whatsapp, p.email as person_email,
       pr.name as program_name, c.name as channel_name, l.name as location_name,
       t.type as transportation_type, d.code as dress_code
     from bookings b
     left join people p on p.id = b.person_id
     left join programs pr on pr.id = b.program_id
     left join channels c on c.id = b.channel_id
     left join locations l on l.id = b.location_id
     left join transportation t on t.booking_id = b.id
     left join dress_codes d on d.booking_id = b.id
     where b.id = $1`;
  const main = await db(sql, [id]);
  out.mainRows = main.rows.length;
  out.mainError = main.error ? main.error.message : null;
  out.firstRowKeys = main.rows[0] ? Object.keys(main.rows[0]).slice(0,15) : null;
  // also simple
  const simple = await db("select id, booking_number from bookings where id = $1", [id]);
  out.simpleRows = simple.rows.length;
  out.simpleError = simple.error ? simple.error.message : null;
  return NextResponse.json(out);
}
