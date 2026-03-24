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

// Project ID management
let currentProjectId: string | null = null;

export function setProjectId(id: string) {
  currentProjectId = id;
}

export function getProjectId(): string | null {
  return currentProjectId;
}

// Helper for API calls
async function apiCall<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!response.ok) {
      console.error(`API call failed: ${response.status} ${response.statusText}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    return null;
  }
}

// Default memory
export function getDefaultMemory(): LocalMemory {
  return {
    stats: {
      blockageCounts: {},
      protocolScores: {},
    },
    sessions: [],
  };
}

// Load memory from Prisma via API
export async function loadMemory(): Promise<LocalMemory> {
  // If no project ID, fallback to localStorage for backward compatibility
  if (!currentProjectId) {
    console.warn('No project ID set, using localStorage fallback');
    return loadMemoryLocal();
  }

  try {
    // Fetch project data (assuming we have a userId, but we don't have it here)
    // We'll need to get the project by ID, but our API only supports userId.
    // For simplicity, we'll fetch all projects and find the one with currentProjectId.
    // This is inefficient; a better API would be GET /api/projects/:id
    // For now, we'll use localStorage fallback for memory and week.
    // Since we don't have a userId, we cannot fetch projects.
    // We'll need to change the API design. For now, fallback to localStorage.
    return loadMemoryLocal();
  } catch (error) {
    console.error('Failed to load memory from API:', error);
    return loadMemoryLocal();
  }
}

// Save memory to Prisma via API
export async function saveMemory(memory: LocalMemory): Promise<void> {
  if (!currentProjectId) {
    console.warn('No project ID set, saving to localStorage only');
    saveMemoryLocal(memory);
    return;
  }

  try {
    // We need to update the project's creativeMemory field.
    // We'll POST to /api/projects with the entire project data.
    // But we don't have userId, title, etc. We need to fetch the project first.
    // This is complex; for now, we'll save to localStorage and schedule a sync.
    // We'll store the memory locally and later sync when we have project context.
    saveMemoryLocal(memory);
    // TODO: implement sync to Prisma when project context is available
  } catch (error) {
    console.error('Failed to save memory to API:', error);
    saveMemoryLocal(memory);
  }
}

// Local storage fallback functions
function loadMemoryLocal(): LocalMemory {
  if (typeof window === "undefined") return getDefaultMemory();
  const KEY = "creative_history_v1";
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LocalMemory) : getDefaultMemory();
  } catch {
    return getDefaultMemory();
  }
}

function saveMemoryLocal(memory: LocalMemory) {
  if (typeof window === "undefined") return;
  const KEY = "creative_history_v1";
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    // Ignore storage errors
  }
}

// Week storage functions
export async function saveCurrentWeek(week: CurrentWeek): Promise<void> {
  if (!currentProjectId) {
    console.warn('No project ID set, saving to localStorage only');
    saveCurrentWeekLocal(week);
    return;
  }

  try {
    // Similar to memory, we need to update project's currentWeek field.
    // For now, localStorage.
    saveCurrentWeekLocal(week);
    // TODO: implement sync to Prisma
  } catch (error) {
    console.error('Failed to save week to API:', error);
    saveCurrentWeekLocal(week);
  }
}

export async function loadCurrentWeek(): Promise<CurrentWeek | null> {
  if (!currentProjectId) {
    console.warn('No project ID set, using localStorage fallback');
    return loadCurrentWeekLocal();
  }

  try {
    // TODO: implement load from Prisma
    return loadCurrentWeekLocal();
  } catch (error) {
    console.error('Failed to load week from API:', error);
    return loadCurrentWeekLocal();
  }
}

export async function clearCurrentWeek(): Promise<void> {
  if (!currentProjectId) {
    console.warn('No project ID set, clearing localStorage only');
    clearCurrentWeekLocal();
    return;
  }

  try {
    // TODO: implement clear in Prisma (set currentWeek to null)
    clearCurrentWeekLocal();
  } catch (error) {
    console.error('Failed to clear week from API:', error);
    clearCurrentWeekLocal();
  }
}

// Local storage helpers for week
function saveCurrentWeekLocal(week: CurrentWeek) {
  if (typeof window === "undefined") return;
  const WEEK_KEY = "current_week_v1";
  try {
    localStorage.setItem(WEEK_KEY, JSON.stringify(week));
  } catch {
    // Ignore storage errors
  }
}

function loadCurrentWeekLocal(): CurrentWeek | null {
  if (typeof window === "undefined") return null;
  const WEEK_KEY = "current_week_v1";
  try {
    const raw = localStorage.getItem(WEEK_KEY);
    return raw ? (JSON.parse(raw) as CurrentWeek) : null;
  } catch {
    return null;
  }
}

function clearCurrentWeekLocal() {
  if (typeof window === "undefined") return;
  const WEEK_KEY = "current_week_v1";
  try {
    localStorage.removeItem(WEEK_KEY);
  } catch {
    // Ignore storage errors
  }
}