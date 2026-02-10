import { getSupabaseClient } from "./supabaseClient";

export interface Project {
  id: string;
  title: string;
  user_id: string;
  type: "moodboard" | "mindmap" | "canvas" | "chat";
  created_at: string;
  updated_at: string;
  status: "active" | "archived";
}

export const projectService = {
  async getProjects(userId: string, limit = 5): Promise<Project[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("getProjects error:", error);
      return [];
    }

    return data ?? [];
  },

  async createProject(
    userId: string,
    type: Project["type"] = "canvas"
  ): Promise<Project> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase not available");
    }

    const project = {
      title: "Sin título",
      user_id: userId,
      type,
      status: "active",
    };

    const { data, error } = await supabase
      .from("projects")
      .insert([project])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProjectTitle(projectId: string, title: string): Promise<Project> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Supabase not available");
    }

    const { data, error } = await supabase
      .from("projects")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", projectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default projectService;
