import { cn } from "@/lib/utils";
import type { ConfirmationStatus } from "@/lib/types";
import { STATUS_STYLES } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("chip bg-surface-3 text-muted", className)}>{children}</span>;
}

export function StatusBadge({ status }: { status: ConfirmationStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={cn("chip", s.bg, s.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function Dot({ className }: { className?: string }) {
  return <span className={cn("h-2 w-2 rounded-full", className)} />;
}
