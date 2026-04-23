import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: string;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const t = (tier || "").toUpperCase();

  if (t === "HOT") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold",
          "bg-red-600 text-white",
          className
        )}
      >
        🔥 HOT
      </span>
    );
  }

  if (t === "WARM") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold",
          "bg-amber-400 text-amber-900",
          className
        )}
      >
        🟡 WARM
      </span>
    );
  }

  // COLD (default)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold",
        "bg-slate-600 text-white",
        className
      )}
    >
      ❄️ COLD
    </span>
  );
}
