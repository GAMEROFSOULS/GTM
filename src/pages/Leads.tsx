import { useMemo, useState } from "react";
import { Download, ExternalLink, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TierBadge } from "@/components/TierBadge";
import { EmptyState } from "@/components/EmptyState";
import { LeadDrawer } from "@/components/LeadDrawer";
import { useLeads } from "@/hooks/useLeads";
import { useAgentStore } from "@/store/agentStore";
import type { Lead } from "@/types/lead";

const PER_PAGE = 20;

function truncate(s: string, n = 70) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function toCSV(leads: Lead[]): string {
  const headers = ["Name","Email","LinkedIn","Company","Score","Tier","Reason","Pitch","Email_Subject","Side","Qualified_At","Status"];
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = leads.map(l => [l.name, l.email, l.linkedin, l.company, l.score, l.tier, l.reason, l.pitch, l.email_subject, l.side, l.qualified_at, l.status].map(escape).join(","));
  return [headers.join(","), ...rows].join("\n");
}

export default function Leads() {
  const { data: leads = [], isLoading, isError, error } = useLeads();
  const converted = useAgentStore((s) => s.converted);
  const archived = useAgentStore((s) => s.archived);

  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [sideFilter, setSideFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (converted.has(l.id) || archived.has(l.id)) return false;
      if (tierFilter !== "ALL" && l.tier?.toUpperCase() !== tierFilter) return false;
      if (sideFilter !== "ALL") {
        const s = (l.side || "").toLowerCase();
        if (!s.includes(sideFilter.toLowerCase())) return false;
      }
      if (q) {
        const hay = `${l.name} ${l.email} ${l.company}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, search, tierFilter, sideFilter, converted, archived]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleExport = () => {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openLead = (l: Lead) => { setSelected(l); setDrawerOpen(true); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Leads</h1>
        <p className="text-muted-foreground mt-1">All qualified leads from your GTM agent.</p>
      </div>

      <Card className="p-4 shadow-card">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, or company…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <Select value={tierFilter} onValueChange={(v) => { setTierFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full lg:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Tiers</SelectItem>
              <SelectItem value="HOT">🔥 HOT</SelectItem>
              <SelectItem value="WARM">🟡 WARM</SelectItem>
              <SelectItem value="COLD">❄️ COLD</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sideFilter} onValueChange={(v) => { setSideFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full lg:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sides</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline" disabled={filtered.length === 0}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </Card>

      <Card className="shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-destructive">Failed to load: {(error as Error)?.message}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No leads yet"
            description="Configure your ICP on the Dashboard and launch the GTM agent to start discovering pre-qualified leads."
            actionLabel="Go to Dashboard →"
            actionTo="/"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>LinkedIn</TableHead>
                    <TableHead className="hidden md:table-cell">Company</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="hidden lg:table-cell">Pitch</TableHead>
                    <TableHead className="hidden md:table-cell">Side</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageData.map((l) => (
                    <TableRow key={l.id} onClick={() => openLead(l)} className="cursor-pointer">
                      <TableCell className="font-medium">{l.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{l.email}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {l.linkedin ? (
                          <a href={l.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1 hover:underline">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{l.company}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <span className="font-mono text-sm w-5">{l.score}</span>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.max(0, Math.min(10, l.score)) * 10}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><TierBadge tier={l.tier} /></TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-xs">{truncate(l.pitch)}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm capitalize">{l.side}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{l.qualified_at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <span className="text-sm font-mono">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <LeadDrawer lead={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
