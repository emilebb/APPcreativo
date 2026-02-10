"use client";

import { useState } from "react";
import { projectService, type Project } from "@/lib/projectService";
import { Edit2, Check, X } from "lucide-react";

interface ProjectTitleEditorProps {
  project: Project;
  onUpdate?: (updatedProject: Project) => void;
}

export default function ProjectTitleEditor({ project, onUpdate }: ProjectTitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (title.trim() === "") return;
    
    setLoading(true);
    try {
      const updatedProject = await projectService.updateProjectTitle(project.id, title.trim());
      setTitle(updatedProject.title);
      onUpdate?.(updatedProject);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating title:", error);
      // Revertir al título original si hay error
      setTitle(project.title);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle(project.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe el título..."
          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
          autoFocus
          disabled={loading}
        />
        <button
          onClick={handleSave}
          disabled={loading || title.trim() === ""}
          className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Guardar"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Cancelar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h1 className="text-2xl font-bold text-gray-900">
        {title}
      </h1>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Editar título"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
  );
}
