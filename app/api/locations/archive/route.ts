import { archiveLocation } from "@/services/crud";
export async function POST(req: Request) {
  const fd = await req.formData();
  return Response.json(await archiveLocation(fd.get("id") as string));
}
