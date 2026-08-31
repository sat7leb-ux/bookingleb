import { archiveProgram } from "@/services/crud";

export async function POST(req: Request) {
  const fd = await req.formData();
  const res = await archiveProgram(fd.get("id") as string);
  return Response.json(res);
}
