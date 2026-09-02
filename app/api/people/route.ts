import { upsertPerson, archivePerson, deletePerson } from "@/services/crud";

export async function POST(req: Request) {
  const fd = await req.formData();
  const res = await upsertPerson(fd);
  return Response.json(res);
}

export async function DELETE(req: Request) {
  const fd = await req.formData();
  const id = (fd.get("id") as string) ?? "";
  if (!id) return Response.json({ ok: false, message: "Missing person id." });
  const res = await deletePerson(id);
  return Response.json(res);
}
