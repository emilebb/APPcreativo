/**
 * projectService stub - usando localStorage
 * Reemplaza el projectService de Firebase
 */

"use client";

export interface Project {
  id: string;
  title: string;
  type: "mindmap" | "moodboard" | "canvas";
  ownerId: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  data?: any;
}

const STORAGE_PREFIX = "projects";

const getProjects = (): Project[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_PREFIX);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const saveProjects = (projects: Project[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_PREFIX, JSON.stringify(projects));
};

export const projectService = {
  async getProjects(userId: string, limit?: number): Promise<Project[]> {
    const projects = getProjects();
    const userProjects = projects.filter((p) => p.ownerId === userId);
    return limit ? userProjects.slice(0, limit) : userProjects;
  },

  async getProject(projectId: string): Promise<Project | null> {
    const projects = getProjects();
    return projects.find((p) => p.id === projectId) || null;
  },

  async createProject(userId: string, type: Project["type"], data?: Partial<Project>): Promise<Project> {
    const projects = getProjects();
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: data?.title || `Nuevo ${type}`,
      type,
      ownerId: userId,
      user_id: userId,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      data: data?.data,
    };
    projects.push(newProject);
    saveProjects(projects);
    return newProject;
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
    const projects = getProjects();
    const index = projects.findIndex((p) => p.id === projectId);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveProjects(projects);
    return projects[index];
  },

  async updateProjectTitle(projectId: string, title: string): Promise<Project | null> {
    return this.updateProject(projectId, { title });
  },

  async deleteProject(projectId: string): Promise<boolean> {
    const projects = getProjects();
    const filtered = projects.filter((p) => p.id !== projectId);
    if (filtered.length === projects.length) return false;
    saveProjects(filtered);
    return true;
  },
};

export default projectService;
