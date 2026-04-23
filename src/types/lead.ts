export type Tier = "HOT" | "WARM" | "COLD" | string;
export type Side = "expert" | "client" | "Expert" | "Client" | string;

export interface Lead {
  id: string;              // uuid from Supabase (primary key)
  name: string;
  email: string;
  linkedin: string;        // maps to linkedin_url column
  company: string;
  score: number;           // maps to ai_score column
  tier: Tier;              // maps to ai_tier column
  reason: string;          // maps to ai_reason column
  pitch: string;           // maps to reloadium_pitch column
  email_subject: string;
  email_body?: string;     // maps to email_body column
  side: Side;
  qualified_at: string;    // maps to created_at column
  status: string;
}

export interface ICPConfig {
  target_role: string;
  industry: string;
  location: string;       // comma-joined
  topic: string;
  side: "expert" | "client";
  company_size: string;   // string per spec
}
