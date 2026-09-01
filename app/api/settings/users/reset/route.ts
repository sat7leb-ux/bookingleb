import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: false,
    message: "Password reset is now handled during user creation. Set the password in the Add User form.",
  });
}
