import { create } from "zustand";
import type { ICPConfig } from "@/types/lead";

interface AgentState {
  agentLaunched: boolean;
  lastConfig: ICPConfig | null;
  converted: Set<string>;       // lead ids
  archived: Set<string>;        // lead ids
  setLaunched: (config: ICPConfig) => void;
  markConverted: (id: string) => void;
  markArchived: (id: string) => void;
  reset: () => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agentLaunched: false,
  lastConfig: null,
  converted: new Set(),
  archived: new Set(),
  setLaunched: (config) => set({ agentLaunched: true, lastConfig: config }),
  markConverted: (id) =>
    set((s) => {
      const next = new Set(s.converted);
      next.add(id);
      return { converted: next };
    }),
  markArchived: (id) =>
    set((s) => {
      const next = new Set(s.archived);
      next.add(id);
      return { archived: next };
    }),
  reset: () => set({ converted: new Set(), archived: new Set() }),
}));
