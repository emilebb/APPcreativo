interface MoodboardImage {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

interface Moodboard {
  id: string;
  title: string;
  description?: string;
  layout: string;
  images: MoodboardImage[];
  createdAt: string;
  updatedAt: string;
}

const moodboardService = {
  async getMoodboard(id: string): Promise<Moodboard | null> {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(`moodboard-${id}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading moodboard from localStorage:", error);
    }

    return null;
  },

  async saveMoodboard(moodboard: Moodboard): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.setItem(`moodboard-${moodboard.id}`, JSON.stringify(moodboard));
      return true;
    } catch (error) {
      console.error("Error saving moodboard to localStorage:", error);
      return false;
    }
  },

  async getAllMoodboards(): Promise<Moodboard[]> {
    if (typeof window === 'undefined') return [];
    
    const moodboards: Moodboard[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("moodboard-")) {
          const stored = localStorage.getItem(key);
          if (stored) {
            moodboards.push(JSON.parse(stored));
          }
        }
      }
    } catch (error) {
      console.error("Error loading moodboards from localStorage:", error);
    }

    return moodboards.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async deleteMoodboard(id: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.removeItem(`moodboard-${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting moodboard from localStorage:", error);
      return false;
    }
  },

  extractColorsFromImage(imageUrl: string): string[] {
    const mockColors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
      "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2",
      "#F8B500", "#E74C3C", "#3498DB", "#2ECC71",
      "#9B59B6", "#1ABC9C", "#E67E22", "#34495E"
    ];

    return mockColors
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);
  },
};

export default moodboardService;
