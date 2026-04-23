import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { testWebhook } from "@/lib/n8n";
import { fetchLeadsRaw, supabaseConfigured } from "@/hooks/useLeads";

function mask(value?: string) {
  if (!value) return "Not configured";
  if (value.length <= 8) return "•".repeat(value.length);
  return value.slice(0, 4) + "•".repeat(Math.max(4, value.length - 8)) + value.slice(-4);
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;

const credentials = [
  { name: "Apify API Key", purpose: "LinkedIn + Reddit scraping" },
  { name: "Hunter.io API Key", purpose: "email finding" },
  { name: "OpenAI API Key", purpose: "GPT-4o-mini lead scoring" },
  { name: "Supabase Project URL + Anon Key", purpose: "lead logging & storage" },
  { name: "Slack Webhook URL", purpose: "HOT lead alerts" },
  { name: "Gmail OAuth2", purpose: "sending outreach emails" },
];

interface TestResult { ok: boolean; message: string }

export default function Settings() {
  const [n8nResult, setN8nResult] = useState<TestResult | null>(null);
  const [n8nTesting, setN8nTesting] = useState(false);
  const [supabaseResult, setSupabaseResult] = useState<TestResult | null>(null);
  const [supabaseTesting, setSupabaseTesting] = useState(false);

  const handleTestN8n = async () => {
    setN8nTesting(true);
    setN8nResult(null);
    const r = await testWebhook();
    setN8nResult(r);
    setN8nTesting(false);
  };

  const handleTestSupabase = async () => {
    setSupabaseTesting(true);
    setSupabaseResult(null);
    try {
      const leads = await fetchLeadsRaw();
      setSupabaseResult({ ok: true, message: `Connected. ${leads.length} lead(s) found.` });
    } catch (e) {
      setSupabaseResult({ ok: false, message: (e as Error).message });
    } finally {
      setSupabaseTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage integrations and view required credentials.</p>
      </div>

      {/* n8n */}
      <Card className="p-6 shadow-card space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold">n8n Integration</h2>
          <p className="text-sm text-muted-foreground">Webhook used to launch the lead discovery agent.</p>
        </div>
        <div className="space-y-2">
          <Label>n8n Webhook URL</Label>
          <Input readOnly value={mask(WEBHOOK_URL)} className="font-mono text-sm" />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleTestN8n} disabled={n8nTesting} variant="outline">
            {n8nTesting && <Loader2 className="h-4 w-4 animate-spin" />}
            Test Connection
          </Button>
          {n8nResult && <ResultPill result={n8nResult} />}
        </div>
      </Card>

      {/* Supabase */}
      <Card className="p-6 shadow-card space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Supabase Integration</h2>
          <p className="text-sm text-muted-foreground">Source of truth for qualified leads.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Supabase URL</Label>
            <Input readOnly value={mask(SUPABASE_URL)} className="font-mono text-sm" />
          </div>
          <div className="space-y-2">
            <Label>Supabase Anon Key</Label>
            <Input readOnly value={mask(SUPABASE_ANON_KEY)} className="font-mono text-sm" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleTestSupabase} disabled={supabaseTesting || !supabaseConfigured} variant="outline">
            {supabaseTesting && <Loader2 className="h-4 w-4 animate-spin" />}
            Test Connection
          </Button>
          {supabaseResult && <ResultPill result={supabaseResult} />}
        </div>
      </Card>

      {/* Credentials Info */}
      <Card className="p-6 shadow-card border-primary/30 bg-primary/5">
        <div className="flex items-start gap-3 mb-4">
          <Info className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h2 className="font-display text-lg font-semibold">n8n Credentials Required</h2>
            <p className="text-sm text-muted-foreground">Configure these inside your n8n workflow.</p>
          </div>
        </div>
        <ul className="space-y-2">
          {credentials.map((c) => (
            <li key={c.name} className="flex items-start gap-3 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <div>
                <span className="font-medium text-foreground">{c.name}</span>
                <span className="text-muted-foreground"> — {c.purpose}</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Schedule */}
      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-base">Auto-run every 6 hours</Label>
            <p className="text-sm text-muted-foreground mt-1">
              The n8n workflow runs automatically every 6 hours. Configure schedule inside n8n.
            </p>
          </div>
          <Switch checked disabled aria-label="Auto-run schedule (read-only)" />
        </div>
      </Card>
    </div>
  );
}

function ResultPill({ result }: { result: TestResult }) {
  return (
    <div className={`inline-flex items-center gap-1.5 text-sm ${result.ok ? "text-success" : "text-destructive"}`}>
      {result.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      <span>{result.message}</span>
    </div>
  );
}
