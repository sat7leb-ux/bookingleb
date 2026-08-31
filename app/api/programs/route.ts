import { upsertProgram } from "@/services/crud";

export async function POST(req: Request) {
  const fd = await req.formData();
  const res = await upsertProgram(fd);
  return Response.json(res);
}
