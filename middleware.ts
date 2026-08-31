export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/((?!api/auth|api/__probe|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
