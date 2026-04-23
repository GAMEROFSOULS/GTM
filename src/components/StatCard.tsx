import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  emoji?: string;
  accent?: "default" | "hot" | "warm" | "primary";
}

export function StatCard({ label, value, emoji, accent = "default" }: StatCardProps) {
  const accentClass =
    accent === "hot"
      ? "text-hot"
      : accent === "warm"
        ? "text-warm"
        : accent === "primary"
          ? "text-primary"
          : "text-foreground";

  return (
    <Card className="p-5 shadow-card hover:shadow-glow transition-all duration-300 animate-fade-in-up">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
      <div className={`mt-2 font-display text-3xl sm:text-4xl font-bold ${accentClass}`}>
        {emoji && <span className="mr-2">{emoji}</span>}
        {value}
      </div>
    </Card>
  );
}
