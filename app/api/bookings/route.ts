import { createBooking, updateBooking } from "@/services/bookings";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[bookings POST] body keys:", Object.keys(body ?? {}), "editId:", body?.editId);
    const editId = body?.editId;
    const input = (({ editId, ...rest }: any) => rest)(body);
    const result = editId ? await updateBooking(editId, input) : await createBooking(input);
    console.log("[bookings POST] result:", result);
    return Response.json(result, { status: result.ok ? (editId ? 200 : 201) : 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid request";
    console.log("[bookings POST] error:", message);
    return Response.json({ ok: false, message }, { status: 400 });
  }
}
