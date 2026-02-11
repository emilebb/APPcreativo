export type CreativeMode = "calm" | "direct";

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
  currentProject?: {
    id: string;
    name: string;
  };
};
