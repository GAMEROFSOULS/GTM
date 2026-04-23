import type { ICPConfig } from "@/types/lead";

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;

export const webhookConfigured = Boolean(WEBHOOK_URL);

export async function launchAgent(config: ICPConfig): Promise<void> {
  if (!WEBHOOK_URL) throw new Error("VITE_N8N_WEBHOOK_URL is not configured.");
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Webhook ${res.status}: ${txt || "request failed"}`);
  }
}

export async function testWebhook(): Promise<{ ok: boolean; message: string }> {
  if (!WEBHOOK_URL) return { ok: false, message: "VITE_N8N_WEBHOOK_URL not set." };
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: true, source: "reloadium-gtm-agent" }),
    });
    return { ok: res.ok, message: res.ok ? `Connected (${res.status})` : `Failed (${res.status})` };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
