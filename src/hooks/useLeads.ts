import { useQuery } from "@tanstack/react-query";
import type { Lead } from "@/types/lead";
import { supabase } from "@/lib/supabase";
import { useAgentStore } from "@/store/agentStore";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// ---------------------------------------------------------------------------
// Column mapping — actual Supabase table schema:
//   id, full_name, email, linkedin_url, headline, company,
//   side, score, tier, reason, qualified_at
// ---------------------------------------------------------------------------
function rowToLead(row: Record<string, unknown>): Lead {
  const qualifiedAt = (row.qualified_at as string) ?? "";
  // Format timestamp as "YYYY-MM-DD HH:mm" if it looks like an ISO string
  const formattedDate = qualifiedAt
    ? qualifiedAt.slice(0, 16).replace("T", " ")
    : "";

  return {
    id:            (row.id as string) ?? "",
    name:          (row.full_name as string) ?? "",
    email:         (row.email as string) ?? "",
    linkedin:      (row.linkedin_url as string) ?? "",
    company:       (row.company as string) ?? (row.headline as string) ?? "",
    score:         typeof row.score === "number"
                     ? row.score
                     : parseInt(String(row.score ?? "0"), 10) || 0,
    tier:          ((row.tier as string) ?? "COLD").toUpperCase(),
    reason:        (row.reason as string) ?? "",
    pitch:         "",      // not in this schema — kept for type compat
    email_subject: "",      // not in this schema — kept for type compat
    email_body:    "",      // not in this schema — kept for type compat
    side:          (row.side as string) ?? "",
    qualified_at:  formattedDate,
    status:        (row.status as string) ?? "",
  };
}

export async function fetchLeadsRaw(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("id, full_name, email, linkedin_url, headline, company, side, score, tier, reason, qualified_at, status")
    .order("qualified_at", { ascending: false })
    .limit(500);

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return (data ?? []).map(rowToLead);
}

export function useLeads() {
  const launched = useAgentStore((s) => s.agentLaunched);
  return useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeadsRaw,
    refetchInterval: launched ? 30_000 : false,
    enabled: supabaseConfigured,
    retry: 1,
    staleTime: 0,
  });
}

// Backward-compat alias
export { supabaseConfigured as sheetsConfigured };
