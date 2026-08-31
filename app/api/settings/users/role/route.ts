import { updateUserRole } from "@/services/settings";
export async function POST(req: Request) {
  const fd = await req.formData();
  return Response.json(await updateUserRole(fd));
}
