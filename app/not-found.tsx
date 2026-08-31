import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl font-bold text-fg">404</p>
      <p className="text-sm text-muted">This page or booking could not be found.</p>
      <Link href="/dashboard" className="btn-primary">Back to dashboard</Link>
    </div>
  );
}
