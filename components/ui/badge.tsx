import { cn } from "@/lib/cn";

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "light";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em]",
        tone === "default" && "border border-ink/8 bg-white/75 text-ink/70 shadow-sm backdrop-blur",
        tone === "light" && "border border-white/20 bg-white/12 text-white backdrop-blur",
      )}
    >
      {children}
    </span>
  );
}
