import { cn } from "@/lib/utils";

export function Avatar({
  name,
  size = 32,
  className,
}: {
  name?: string | null;
  size?: number;
  className?: string;
}) {
  const init = (name || "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 text-fg font-semibold",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {init}
    </span>
  );
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-xs font-semibold uppercase tracking-wider text-muted-2", className)}>
      {children}
    </h2>
  );
}
