import { setBookingStatus } from "@/services/bookings";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const status = body?.confirmation_status;
    if (!status) return Response.json({ ok: false, message: "Missing confirmation_status" }, { status: 400 });
    const res = await setBookingStatus(id, status);
    return Response.json(res);
  } catch (err) {
    return Response.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
}
