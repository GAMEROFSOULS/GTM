import { ExternalLink, Mail } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { TierBadge } from "./TierBadge";
import { useAgentStore } from "@/store/agentStore";
import { toast } from "sonner";
import type { Lead } from "@/types/lead";

interface LeadDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(10, score)) / 10;
  const color = score >= 8 ? "hsl(var(--hot))" : score >= 5 ? "hsl(var(--warm))" : "hsl(var(--cold))";
  const r = 36;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-24 h-24">
      <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
        <circle cx="44" cy="44" r={r} stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
        <circle
          cx="44" cy="44" r={r}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold">{score}</span>
        <span className="text-[10px] text-muted-foreground">/10</span>
      </div>
    </div>
  );
}

export function LeadDrawer({ lead, open, onOpenChange }: LeadDrawerProps) {
  const markConverted = useAgentStore((s) => s.markConverted);
  const markArchived = useAgentStore((s) => s.markArchived);

  if (!lead) return null;

  const handleConverted = () => {
    markConverted(lead.id);
    toast.success("Marked as converted ✅", { description: `${lead.name} hidden from list.` });
    onOpenChange(false);
  };
  const handleArchived = () => {
    markArchived(lead.id);
    toast("Archived 🗃️", { description: `${lead.name} hidden from list.` });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-2xl">{lead.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${lead.email}`} className="hover:text-primary break-all">{lead.email}</a>
              </div>
              <div className="text-muted-foreground">{lead.company}</div>
              {lead.linkedin && (
                <a
                  href={lead.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  LinkedIn <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <ScoreRing score={lead.score} />
          </div>

          <div className="flex items-center gap-2">
            <TierBadge tier={lead.tier} />
            <span className="text-xs text-muted-foreground">Side: {lead.side}</span>
            <span className="text-xs text-muted-foreground">· {lead.qualified_at}</span>
          </div>

          <Section title="AI Reason">{lead.reason || "—"}</Section>
          <Section title="Personalized Reloadium Pitch">{lead.pitch || "—"}</Section>
          <Section title="Email Subject">{lead.email_subject || "—"}</Section>
          <Section title="Email Body">{lead.email_body || lead.pitch || "—"}</Section>

          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
            <Button onClick={handleConverted} className="flex-1 bg-success text-success-foreground hover:bg-success/90">
              Mark as Converted ✅
            </Button>
            <Button onClick={handleArchived} variant="secondary" className="flex-1">
              Archive 🗃️
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">{title}</div>
      <div className="text-sm text-foreground whitespace-pre-wrap">{children}</div>
    </div>
  );
}
