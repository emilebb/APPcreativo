// lib/memory.local.ts
import type { BlockageId } from "./conversationBrain";

export type MemoryStats = {
  blockageCounts: Record<string, number>;
  protocolScores: Record<string, number>;
};

export type SessionRecord = {
  startedAt: string;
  endedAt: string;
  blockageId?: BlockageId;
  protocolId?: string;
  outcome?: "helpful" | "not_helpful" | "unknown";
};

export type LocalMemory = {
  stats: MemoryStats;
  sessions: SessionRecord[];
};

const KEY = "creative_history_v1";

export function getDefaultMemory(): LocalMemory {
  return {
    stats: {
      blockageCounts: {},
      protocolScores: {},
    },
    sessions: [],
  };
}

export function loadMemory(): LocalMemory {
  if (typeof window === "undefined") return getDefaultMemory();

  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LocalMemory) : getDefaultMemory();
  } catch {
    return getDefaultMemory();
  }
}

export function saveMemory(memory: LocalMemory) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    // Ignore storage errors
  }
}

// ========================================
// Week Storage (for 7-day protocols)
// ========================================

export type DayProgress = {
  done: boolean;
  result?: string;
};

export type CurrentWeek = {
  projectTitle: string;
  startedAt: string;
  currentDay: number;
  days: Record<number, DayProgress>;
};

const WEEK_KEY = "current_week_v1";

export function saveCurrentWeek(week: CurrentWeek) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WEEK_KEY, JSON.stringify(week));
  } catch {
    // Ignore storage errors
  }
}

export function loadCurrentWeek(): CurrentWeek | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(WEEK_KEY);
    return raw ? (JSON.parse(raw) as CurrentWeek) : null;
  } catch {
    return null;
  }
}

export function clearCurrentWeek() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WEEK_KEY);
  } catch {
    // Ignore storage errors
  }
}
