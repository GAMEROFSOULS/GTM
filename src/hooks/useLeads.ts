import { useQuery } from "@tanstack/react-query";
import type { Lead } from "@/types/lead";
import { supabase } from "@/lib/supabase";
import { useAgentStore } from "@/store/agentStore";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// ---------------------------------------------------------------------------
// Defensive mapper — handles both possible column name variants so we never
// crash if the schema uses 'name' instead of 'full_name', etc.
// ---------------------------------------------------------------------------
function str(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    if (row[key] != null && row[key] !== "") return String(row[key]);
  }
  return "";
}

function num(row: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    if (row[key] != null) {
      const n = typeof row[key] === "number" ? row[key] as number : parseInt(String(row[key]), 10);
      if (!isNaN(n)) return n;
    }
  }
  return 0;
}

function rowToLead(row: Record<string, unknown>): Lead {
  // name  ← tries 'name', 'full_name' in order
  const name          = str(row, "name", "full_name");
  // score ← tries 'score', 'ai_score'
  const score         = num(row, "score", "ai_score");
  // tier  ← tries 'tier', 'ai_tier'
  const tier          = str(row, "tier", "ai_tier").toUpperCase() || "COLD";
  // reason ← tries 'reason', 'ai_reason'
  const reason        = str(row, "reason", "ai_reason");
  // pitch ← tries 'reloadium_pitch', 'pitch'
  const pitch         = str(row, "reloadium_pitch", "pitch");
  // date  ← tries 'qualified_at', 'created_at'
  const rawDate       = str(row, "qualified_at", "created_at");
  const formattedDate = rawDate ? rawDate.slice(0, 16).replace("T", " ") : "";

  return {
    id:            str(row, "id"),
    name,
    email:         str(row, "email"),
    linkedin:      str(row, "linkedin_url", "linkedin"),
    company:       str(row, "company", "headline"),
    score,
    tier,
    reason,
    pitch,
    email_subject: str(row, "email_subject"),
    email_body:    str(row, "email_body"),
    side:          str(row, "side"),
    qualified_at:  formattedDate,
    status:        str(row, "status"),
  };
}

export async function fetchLeadsRaw(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")                                     // fetch all columns — no column name assumptions
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    // Try ordering by qualified_at if created_at doesn't exist
    const fallback = await supabase
      .from("leads")
      .select("*")
      .limit(500);

    if (fallback.error) {
      throw new Error(`Supabase error: ${fallback.error.message}`);
    }

    // Sort in JS if no ordering column found
    const rows = (fallback.data ?? []) as Record<string, unknown>[];
    rows.sort((a, b) => {
      const aDate = str(a, "qualified_at", "created_at");
      const bDate = str(b, "qualified_at", "created_at");
      return bDate.localeCompare(aDate);
    });
    return rows.map(rowToLead);
  }

  return (data as Record<string, unknown>[]).map(rowToLead);
}

export function useLeads() {
  const launched = useAgentStore((s) => s.agentLaunched);
  return useQuery({
    queryKey: ["leads"],
    queryFn:  fetchLeadsRaw,
    refetchInterval: launched ? 30_000 : false,
    enabled:  supabaseConfigured,
    retry:    1,
    staleTime: 0,
  });
}

// Backward-compat alias
export { supabaseConfigured as sheetsConfigured };
