import { createBooking, updateBooking } from "@/services/bookings";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const editId = body?.editId;
    const input = (({ editId, ...rest }) => rest)(body);
    const result = editId ? await updateBooking(editId, input) : await createBooking(input);
    return Response.json(result, { status: result.ok ? (editId ? 200 : 201) : 400 });
  } catch {
    return Response.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
}
