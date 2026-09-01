import { createUser, deleteUser } from "@/services/settings";
export async function POST(req: Request) {
  const fd = await req.formData();
  return Response.json(await createUser(fd));
}
export async function DELETE(req: Request) {
  const fd = await req.formData();
  return Response.json(await deleteUser(fd));
}
