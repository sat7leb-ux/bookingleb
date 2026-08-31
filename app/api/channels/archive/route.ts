import { archiveChannel } from "@/services/crud";
export async function POST(req: Request) {
  const fd = await req.formData();
  return Response.json(await archiveChannel(fd.get("id") as string));
}
