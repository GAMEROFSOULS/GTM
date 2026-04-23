import { useQuery } from "@tanstack/react-query";
import type { Lead } from "@/types/lead";
import { supabase } from "@/lib/supabase";
import { useAgentStore } from "@/store/agentStore";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Map a Supabase row to the internal Lead shape
// Supabase columns: id, name, email, linkedin_url, company,
//                   ai_score, ai_tier, ai_reason, reloadium_pitch,
//                   email_subject, email_body, side, status, created_at
function rowToLead(row: Record<string, unknown>): Lead {
  return {
    id: (row.id as string) ?? "",
    name: (row.name as string) ?? "",
    email: (row.email as string) ?? "",
    linkedin: (row.linkedin_url as string) ?? "",
    company: (row.company as string) ?? "",
    score: typeof row.ai_score === "number" ? row.ai_score : parseInt(String(row.ai_score ?? "0"), 10) || 0,
    tier: ((row.ai_tier as string) ?? "COLD").toUpperCase(),
    reason: (row.ai_reason as string) ?? "",
    pitch: (row.reloadium_pitch as string) ?? "",
    email_subject: (row.email_subject as string) ?? "",
    email_body: (row.email_body as string) ?? "",
    side: (row.side as string) ?? "",
    qualified_at: (row.created_at as string) ?? "",
    status: (row.status as string) ?? "",
  };
}

export async function fetchLeadsRaw(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

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
  });
}

// Keep backward-compat export so any import of sheetsConfigured doesn't break at build time
export { supabaseConfigured as sheetsConfigured };
