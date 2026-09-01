import { deleteBooking } from "@/services/bookings";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return Response.json(await deleteBooking(id));
}