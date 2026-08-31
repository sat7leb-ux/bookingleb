import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "soft" | "danger" | "success";

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const variants: Record<Variant, string> = {
    primary: "btn-primary",
    ghost: "btn-ghost",
    soft: "btn-soft",
    danger: "btn-danger",
    success: "btn-success",
  };
  return (
    <button className={cn(variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
