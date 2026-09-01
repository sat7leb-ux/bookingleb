import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Clear all auth cookies
  res.cookies.set("authjs.session-token", "", { maxAge: 0, path: "/" });
  res.cookies.set("__Secure-authjs.session-token", "", { maxAge: 0, path: "/" });
  res.cookies.set("authjs.csrf-token", "", { maxAge: 0, path: "/" });
  res.cookies.set("__Host-authjs.csrf-token", "", { maxAge: 0, path: "/" });
  return res;
}
