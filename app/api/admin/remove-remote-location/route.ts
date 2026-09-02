import { NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-migration-secret');
  if (secret !== process.env.MIGRATION_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = neon(process.env.DATABASE_URL as string);

  try {
    const loc = await sql`select id from public.locations where name = 'Remote / Virtual' limit 1`;
    if (!loc.length) {
      return Response.json({ ok: true, message: 'Location already removed' });
    }

    const id = loc[0].id;
    const bl = await sql`select booking_id from public.booking_locations where location_id = ${id}`;

    await sql`delete from public.booking_locations where location_id = ${id}`;
    await sql`delete from public.locations where id = ${id}`;

    return Response.json({
      ok: true,
      removedLocationId: id,
      removedBookingLocationRows: bl.length,
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
