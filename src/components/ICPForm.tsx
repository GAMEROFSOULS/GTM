import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Loader2, Rocket } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { launchAgent, webhookConfigured } from "@/lib/n8n";
import { useAgentStore } from "@/store/agentStore";
import type { ICPConfig } from "@/types/lead";

const INDUSTRIES = ["SaaS", "EdTech", "Finance", "Fitness", "Language Learning", "Career Coaching", "Other"];
const LOCATIONS = ["Europe", "UK", "India", "US", "Global"];

interface FormValues {
  side: "expert" | "client";
  topic: string;
  target_role: string;
  industry: string;
  locations: string[];
  company_size: number;
}

export function ICPForm() {
  const setLaunched = useAgentStore((s) => s.setLaunched);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      side: "expert",
      topic: "",
      target_role: "",
      industry: "SaaS",
      locations: ["Global"],
      company_size: 50,
    },
  });

  const companySize = watch("company_size");

  const onSubmit = async (values: FormValues) => {
    if (!webhookConfigured) {
      toast.error("Webhook not configured", { description: "Set VITE_N8N_WEBHOOK_URL in your environment." });
      return;
    }
    const payload: ICPConfig = {
      target_role: values.target_role,
      industry: values.industry,
      location: values.locations.join(", "),
      topic: values.topic,
      side: values.side,
      company_size: String(values.company_size),
    };
    setSubmitting(true);
    try {
      await launchAgent(payload);
      setLaunched(payload);
      toast.success("✅ Agent launched!", { description: "Leads will appear below shortly." });
    } catch (e) {
      toast.error("Failed to launch agent", { description: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 sm:p-8 shadow-card animate-fade-in-up">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold">Configure Your Ideal Customer Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Tell the agent who to target on Reloadium.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Side */}
        <div className="space-y-2">
          <Label>Target Side</Label>
          <Controller
            control={control}
            name="side"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col sm:flex-row gap-3">
                <label className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-4 py-3 cursor-pointer hover:border-primary transition-colors flex-1">
                  <RadioGroupItem value="expert" id="side-expert" />
                  <span className="font-medium">Expert <span className="text-muted-foreground font-normal">(Supply)</span></span>
                </label>
                <label className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-4 py-3 cursor-pointer hover:border-primary transition-colors flex-1">
                  <RadioGroupItem value="client" id="side-client" />
                  <span className="font-medium">Client <span className="text-muted-foreground font-normal">(Demand)</span></span>
                </label>
              </RadioGroup>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic / Niche</Label>
            <Input id="topic" placeholder="e.g. career coaching, software dev, fitness" {...register("topic", { required: true })} />
            {errors.topic && <p className="text-xs text-destructive">Topic is required.</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_role">Target Role</Label>
            <Input id="target_role" placeholder="e.g. Founder, Coach, Freelance Consultant" {...register("target_role", { required: true })} />
            {errors.target_role && <p className="text-xs text-destructive">Target role is required.</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Industry</Label>
          <Controller
            control={control}
            name="industry"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Controller
            control={control}
            name="locations"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map((loc) => {
                  const selected = field.value.includes(loc);
                  return (
                    <Badge
                      key={loc}
                      onClick={() => {
                        const next = selected ? field.value.filter((l) => l !== loc) : [...field.value, loc];
                        field.onChange(next);
                      }}
                      className={cn(
                        "cursor-pointer transition-all px-3 py-1.5 text-sm border",
                        selected
                          ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                          : "bg-transparent text-muted-foreground border-border hover:border-primary",
                      )}
                    >
                      {loc}
                    </Badge>
                  );
                })}
              </div>
            )}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Company Size</Label>
            <span className="text-sm font-mono text-primary font-semibold">{companySize} employees</span>
          </div>
          <Controller
            control={control}
            name="company_size"
            render={({ field }) => (
              <Slider
                min={1}
                max={500}
                step={1}
                value={[field.value]}
                onValueChange={(v) => field.onChange(v[0])}
              />
            )}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span><span>500</span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-12 text-base bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Agent is discovering leads…
            </>
          ) : (
            <>
              <Rocket className="h-5 w-5" />
              🚀 Launch GTM Agent
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
