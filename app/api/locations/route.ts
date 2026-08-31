import { upsertLocation } from "@/services/crud";

export async function POST(req: Request) {
  const fd = await req.formData();
  const res = await upsertLocation(fd);
  return Response.json(res);
}
