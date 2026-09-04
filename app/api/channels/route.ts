import { upsertChannel, deleteChannel } from "@/services/crud";

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const res = await upsertChannel(fd);
    return Response.json(res, { status: res.ok ? 200 : 400 });
  } catch {
    return Response.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const fd = await req.formData();
    const id = (fd.get("id") as string) ?? "";
    if (!id) return Response.json({ ok: false, message: "Missing channel id." }, { status: 400 });
    const res = await deleteChannel(id);
    return Response.json(res, { status: res.ok ? 200 : 400 });
  } catch {
    return Response.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
}
