import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: string;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const t = (tier || "").toUpperCase();
  if (t === "HOT") {
    return (
      <Badge className={cn("bg-hot text-hot-foreground hover:bg-hot/90 border-0 font-semibold", className)}>
        🔥 HOT
      </Badge>
    );
  }
  if (t === "WARM") {
    return (
      <Badge className={cn("bg-warm text-warm-foreground hover:bg-warm/90 border-0 font-semibold", className)}>
        🟡 WARM
      </Badge>
    );
  }
  return (
    <Badge className={cn("bg-cold text-cold-foreground hover:bg-cold/90 border-0 font-semibold", className)}>
      ❄️ {t || "COLD"}
    </Badge>
  );
}
