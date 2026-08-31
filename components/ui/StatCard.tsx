import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "primary",
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  accent?: "primary" | "success" | "warning" | "violet" | "danger" | "info";
  trend?: string;
}) {
  const accentMap: Record<string, string> = {
    primary: "from-primary/25 to-primary/5 text-primary",
    success: "from-success/25 to-success/5 text-success",
    warning: "from-warning/25 to-warning/5 text-warning",
    violet: "from-violet/25 to-violet/5 text-violet",
    danger: "from-danger/25 to-danger/5 text-danger",
    info: "from-info/25 to-info/5 text-info",
  };
  return (
    <div className="card card-hover p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-fg">{value}</p>
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br",
              accentMap[accent],
            )}
          >
            {icon}
          </div>
        )}
      </div>
      {(sub || trend) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {trend && <span className="font-medium text-success">{trend}</span>}
          {sub && <span className="text-muted-2">{sub}</span>}
        </div>
      )}
    </div>
  );
}
