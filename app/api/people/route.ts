import { upsertPerson } from "@/services/crud";

export async function POST(req: Request) {
  const fd = await req.formData();
  const res = await upsertPerson(fd);
  return Response.json(res);
}
