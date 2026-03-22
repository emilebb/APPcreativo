export type CreativeMode = "calm" | "direct";
export type StartTool = "canvas" | "moodboard" | "mindmap" | "explore";
export type EmailDigestFrequency = "off" | "daily" | "weekly";

export interface NotificationPreferences {
  email_digest: EmailDigestFrequency;
  coach_reminders: boolean;
  project_updates: boolean;
  browser_notifications: boolean;
}

export type Profile = {
  id: string;
  email: string | null;
  preferred_language: string;
  creative_mode: CreativeMode;
  onboarding_completed: boolean;
  avatar_url?: string | null;
  avatar_color: string;
  last_seen: string | null;
  created_at: string;
  start_tool?: StartTool;
  notifications?: NotificationPreferences;
  currentProject?: {
    id: string;
    name: string;
  };
};
