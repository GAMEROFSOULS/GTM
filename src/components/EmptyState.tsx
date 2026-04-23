import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji = "🎯", title, description, actionLabel, actionTo, onAction }: EmptyStateProps) {
  const navigate = useNavigate();
  return (
    <Card className="flex flex-col items-center justify-center text-center py-16 px-6 shadow-card">
      <div className="text-6xl mb-4">{emoji}</div>
      <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel && (
        <Button
          className="mt-6 bg-gradient-primary text-primary-foreground hover:opacity-90"
          onClick={() => (onAction ? onAction() : actionTo && navigate(actionTo))}
        >
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
