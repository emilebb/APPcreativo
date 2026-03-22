export interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  userId: string;
  layout: "freeform" | "grid" | "masonry" | "collage" | "magazine" | "minimal";
  gridCols?: number;
  gap?: number;
  backgroundColor?: string;
  imagePositions?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }>;
  createdAt: string;
}

export const templateService = {
  getTemplates(userId: string): CustomTemplate[] {
    try {
      const stored = localStorage.getItem(`templates-${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error("Error loading templates:", error);
      return [];
    }
  },

  saveTemplate(template: CustomTemplate): boolean {
    try {
      const templates = this.getTemplates(template.userId);
      const existingIndex = templates.findIndex(t => t.id === template.id);
      
      if (existingIndex >= 0) {
        templates[existingIndex] = template;
      } else {
        templates.push(template);
      }

      localStorage.setItem(`templates-${template.userId}`, JSON.stringify(templates));
      return true;
    } catch (error) {
      console.error("Error saving template:", error);
      return false;
    }
  },

  deleteTemplate(userId: string, templateId: string): boolean {
    try {
      const templates = this.getTemplates(userId);
      const filtered = templates.filter(t => t.id !== templateId);
      localStorage.setItem(`templates-${userId}`, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Error deleting template:", error);
      return false;
    }
  },

  createTemplateFromMoodboard(
    userId: string,
    name: string,
    description: string,
    layout: CustomTemplate["layout"],
    images: Array<{ x: number; y: number; width: number; height: number; rotation: number }>,
    gridCols?: number,
    gap?: number,
    backgroundColor?: string
  ): CustomTemplate {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      description,
      userId,
      layout,
      gridCols,
      gap,
      backgroundColor,
      imagePositions: images,
      createdAt: new Date().toISOString(),
    };
  },
};

export default templateService;
