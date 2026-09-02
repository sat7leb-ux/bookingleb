import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isDbConfigured } from "@/lib/config";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in — SAT-7 Production Booking" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const user = await getCurrentUser();
  if (user) redirect(searchParams.next || "/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(600px_400px_at_50%_-10%,rgb(var(--primary)/0.15),transparent_60%)]" />
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-fg shadow-[0_8px_24px_-8px_rgb(var(--primary)/0.8)]">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4.93 4.93a10 10 0 0 0 0 14.14M19.07 4.93a10 10 0 0 1 0 14.14M7.76 7.76a6 6 0 0 0 0 8.48M16.24 7.76a6 6 0 0 1 0 8.48" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-fg">SAT-7 Production Booking</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage production bookings</p>
        </div>

        <div className="card p-6">
          {!isDbConfigured() && (
            <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
              Database is not configured. Set <code>DATABASE_URL</code> in <code>.env.local</code> to enable auth.
            </div>
          )}
          <LoginForm next={searchParams.next} />
        </div>

        
      </div>
    </div>
  );
}
