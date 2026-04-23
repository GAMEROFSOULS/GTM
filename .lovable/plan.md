
# Reloadium GTM Agent — Build Plan

A dark-mode SaaS dashboard for EdgeMindLab that launches an n8n-powered lead discovery agent and displays qualified leads pulled live from a public Google Sheet.

## Design system
- **Palette (dark only):** navy `#0F172A` bg, teal `#14B8A6` primary, white `#F8FAFC` text, slate-700 muted
- **Type:** Space Grotesk (headings), Inter (body) — loaded from Google Fonts
- **Shape:** 12px card radius, 8px input/button radius
- **Motion:** fade-in on mount, soft hover transitions, route fade

## Environment variables (user adds in Lovable)
- `VITE_GOOGLE_SHEET_ID`
- `VITE_GOOGLE_API_KEY`
- `VITE_N8N_WEBHOOK_URL`

> The Google Sheet must be shared as "Anyone with the link → Viewer" for the API key to read it.

## Data layer
- TanStack Query hook `useLeads()` fetches `https://sheets.googleapis.com/v4/spreadsheets/{id}/values/Leads?key={key}`, skips header row, maps to typed `Lead` objects, sorts by `qualified_at` desc
- Polls every **30s** after the agent has been launched (toggled by a global flag); manual refresh always available
- Local UI state (Zustand or React state) tracks per-lead `converted` / `archived` flags for the session

## Page 1 — Dashboard `/`
- **Header:** 🎯 Reloadium GTM Agent · "by EdgeMindLab" · nav (Dashboard / Leads / Settings) · "Run Agent Now" teal CTA (re-POSTs last config)
- **4 stat cards:** Total · 🔥 HOT · 🟡 WARM · Conversion Rate (HOT/Total %, 2 decimals) — all computed live
- **ICP Configuration form** (React Hook Form):
  - Side radio (Expert / Client), Topic, Target Role, Industry dropdown, Location multi-select chips, Company Size slider (1–500 with live value)
  - Submit → POST exact JSON shape to `VITE_N8N_WEBHOOK_URL`, spinner "Agent is discovering leads…", success/error toast (sonner), starts 30s polling
- **Recent Leads** table — last 10 rows with tier badges (HOT rose, WARM amber, COLD slate), truncated reason, external LinkedIn icon

## Page 2 — Leads `/leads`
- Filter bar: search (name/email/company), Tier filter, Side filter, Export CSV (current filtered view)
- Full table: Name · Email · LinkedIn · Company · Score (number + mini progress bar /10) · Tier badge · Pitch (truncated) · Side · Date
- **Row click → right slide-over drawer** (shadcn Sheet): full details, large score with colored ring, tier badge, AI Reason, Reloadium Pitch, Email Subject + Body, "Mark as Converted ✅" / "Archive 🗃️" (local session state, hides from list)
- Pagination: 20/page
- Empty state: 🎯 + copy + "Go to Dashboard →"

## Page 3 — Settings `/settings`
- **n8n Integration card:** masked webhook URL + "Test Connection" (sends test POST, inline result)
- **Google Sheets card:** masked Sheet ID + masked API key + "Test Connection" (fetches first row, inline result)
- **n8n Credentials Required** info panel: Apify, Hunter.io, OpenAI, Google Sheets ID, Slack webhook, Gmail OAuth2
- **Schedule info card:** read-only toggle "Auto-run every 6 hours (configured in n8n)" + explainer

## Global
- Responsive (mobile nav collapses to sheet menu)
- Sonner toasts for all async outcomes
- Skeletons during loads, empty states everywhere
- Footer: "Powered by EdgeMindLab | edgemindlab.com — Generating leads for reloadium.com"

## Out of scope (per your answers)
- No write-back to Google Sheets (Convert/Archive are session-only)
- No backend proxy — webhook + API key are bundled into the frontend (acceptable for this internal tool)
