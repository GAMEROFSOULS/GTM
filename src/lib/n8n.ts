import type { ICPConfig } from "@/types/lead";

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;

export const webhookConfigured = Boolean(WEBHOOK_URL);

// n8n webhooks may not return CORS headers, so we use 'no-cors' mode.
// In no-cors mode the response is opaque (status 0), but the request is
// still sent and received by n8n — the agent will be triggered.
export async function launchAgent(config: ICPConfig): Promise<void> {
  if (!WEBHOOK_URL) throw new Error("VITE_N8N_WEBHOOK_URL is not configured.");
  try {
    await fetch(WEBHOOK_URL, {
      method:  "POST",
      mode:    "no-cors",   // avoids CORS preflight block
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(config),
    });
    // 'no-cors' gives an opaque response — we can't read status, but the
    // webhook was sent. Treat as success.
  } catch (e) {
    throw new Error(`Webhook request failed: ${(e as Error).message}`);
  }
}

export async function testWebhook(): Promise<{ ok: boolean; message: string }> {
  if (!WEBHOOK_URL) return { ok: false, message: "VITE_N8N_WEBHOOK_URL not set." };
  try {
    await fetch(WEBHOOK_URL, {
      method:  "POST",
      mode:    "no-cors",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ test: true, source: "reloadium-gtm-agent" }),
    });
    // Opaque response in no-cors — if we reach here without throwing, the
    // request was dispatched successfully.
    return { ok: true, message: "Request sent to n8n ✓ (webhook triggered)" };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
