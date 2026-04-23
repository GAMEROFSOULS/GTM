import { useMemo } from "react";
import { ExternalLink, RefreshCcw, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/StatCard";
import { ICPForm } from "@/components/ICPForm";
import { TierBadge } from "@/components/TierBadge";
import { EmptyState } from "@/components/EmptyState";
import { useLeads, supabaseConfigured } from "@/hooks/useLeads";

function truncate(s: string, n = 60) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export default function Dashboard() {
  const { data: leads = [], isLoading, isError, error, refetch, isFetching } = useLeads();

  const stats = useMemo(() => {
    const total = leads.length;
    const hot = leads.filter((l) => l.tier?.toUpperCase() === "HOT").length;
    const warm = leads.filter((l) => l.tier?.toUpperCase() === "WARM").length;
    const conversion = total > 0 ? ((hot / total) * 100).toFixed(2) : "0.00";
    return { total, hot, warm, conversion };
  }, [leads]);

  const recent = leads.slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Launch the agent and watch qualified leads roll in.</p>
      </div>

      {!supabaseConfigured && (
        <Card className="p-4 border-warning/40 bg-warning/10 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
          <div className="text-sm">
            <strong className="text-foreground">Supabase not configured.</strong>{" "}
            <span className="text-muted-foreground">
              Set <code className="text-foreground">VITE_SUPABASE_URL</code> and <code className="text-foreground">VITE_SUPABASE_ANON_KEY</code> in your <code className="text-foreground">.env</code> file to load leads.
            </span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard label="Total Leads" value={stats.total} />
            <StatCard label="HOT Leads" value={stats.hot} emoji="🔥" accent="hot" />
            <StatCard label="WARM Leads" value={stats.warm} emoji="🟡" accent="warm" />
            <StatCard label="Conversion Rate" value={`${stats.conversion}%`} accent="primary" />
          </>
        )}
      </div>

      <ICPForm />

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold">Recent Leads</h2>
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card className="shadow-card overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-sm text-destructive">
              Failed to load leads: {(error as Error)?.message}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              title="No leads yet"
              description="Configure your ICP above and launch the GTM agent to start discovering pre-qualified leads."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>LinkedIn</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="hidden md:table-cell">Reason</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{l.email}</TableCell>
                      <TableCell>
                        {l.linkedin ? (
                          <a href={l.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1 hover:underline">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="font-mono">{l.score}</TableCell>
                      <TableCell><TierBadge tier={l.tier} /></TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{truncate(l.reason)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{l.qualified_at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
