import { cn } from "@/lib/utils";

export function AlertBox({
  children,
  variant = "error",
  className,
}: {
  children: React.ReactNode;
  variant?: "error" | "success" | "info";
  className?: string;
}) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-3.5 py-3 text-sm",
        variant === "error" &&
          "border-red-200 bg-red-50 text-[var(--equity-red)]",
        variant === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-900",
        variant === "info" &&
          "border-[var(--border)] bg-[var(--muted)] text-[var(--equity-gray)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
