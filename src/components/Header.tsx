import { NavLink, useNavigate } from "react-router-dom";
import { Menu, Rocket } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/store/agentStore";
import { launchAgent } from "@/lib/n8n";
import { toast } from "sonner";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/leads", label: "Leads" },
  { to: "/settings", label: "Settings" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const lastConfig = useAgentStore((s) => s.lastConfig);
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
      isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted",
    );

  const runAgentNow = async () => {
    if (!lastConfig) {
      toast.info("Configure your ICP first", { description: "Set up your targeting on the Dashboard." });
      navigate("/");
      return;
    }
    setRunning(true);
    try {
      await launchAgent(lastConfig);
      toast.success("✅ Agent launched", { description: "Re-ran with your last configuration." });
    } catch (e) {
      toast.error("Failed to launch agent", { description: (e as Error).message });
    } finally {
      setRunning(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <NavLink to="/" className="flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <div className="leading-tight">
            <div className="font-display font-bold text-base sm:text-lg text-foreground">Reloadium GTM Agent</div>
            <div className="text-[11px] text-muted-foreground">by EdgeMindLab</div>
          </div>
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            onClick={runAgentNow}
            disabled={running}
            className="hidden sm:inline-flex bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
          >
            <Rocket className="h-4 w-4" />
            {running ? "Launching…" : "Run Agent Now"}
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-2 mt-8">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={linkClass}
                  >
                    {item.label}
                  </NavLink>
                ))}
                <Button
                  onClick={() => {
                    setMobileOpen(false);
                    runAgentNow();
                  }}
                  disabled={running}
                  className="mt-4 bg-gradient-primary text-primary-foreground"
                >
                  <Rocket className="h-4 w-4" />
                  {running ? "Launching…" : "Run Agent Now"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
