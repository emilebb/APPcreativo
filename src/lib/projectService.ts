import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, limit as firestoreLimit } from 'firebase/firestore';

export interface Project {
  id: string;
  title: string;
  user_id: string;
  type: "moodboard" | "mindmap" | "canvas" | "chat";
  created_at: string;
  updated_at: string;
  status: "active" | "archived";
}

// LocalStorage key for projects
const PROJECTS_KEY = 'creationx_projects';

// Helper to check if Firebase is available
function isFirebaseAvailable(): boolean {
  return typeof window !== 'undefined' && db !== undefined;
}

// Helper to get all projects from localStorage
function getAllProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading projects from localStorage:', error);
    return [];
  }
}

// Helper to save all projects to localStorage
function saveAllProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects to localStorage:', error);
  }
}

export const projectService = {
  async getProjects(userId: string, limit = 50): Promise<Project[]> {
    // Intentar usar Firebase primero
    if (isFirebaseAvailable()) {
      try {
        const projectsRef = collection(db!, 'projects');
        const q = query(
          projectsRef,
          where('user_id', '==', userId),
          where('status', '==', 'active'),
          orderBy('updated_at', 'desc'),
          firestoreLimit(limit)
        );
        
        const querySnapshot = await getDocs(q);
        const projects: Project[] = [];
        
        querySnapshot.forEach((doc) => {
          projects.push({ id: doc.id, ...doc.data() } as Project);
        });
        
        console.log('✅ Proyectos cargados desde Firebase:', projects.length);
        return projects;
      } catch (error) {
        console.warn('⚠️ Error cargando desde Firebase, usando localStorage:', error);
      }
    }
    
    // Fallback a localStorage
    const allProjects = getAllProjects();
    
    return allProjects
      .filter(p => p.user_id === userId && p.status === 'active')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, limit);
  },

  async createProject(
    userId: string,
    type: Project["type"] = "canvas"
  ): Promise<Project> {
    const projectData = {
      title: "Sin título",
      user_id: userId,
      type,
      status: "active" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Intentar usar Firebase primero
    if (isFirebaseAvailable()) {
      try {
        const projectsRef = collection(db!, 'projects');
        const docRef = await addDoc(projectsRef, projectData);
        
        const project: Project = {
          id: docRef.id,
          ...projectData
        };
        
        console.log('✅ Proyecto creado en Firebase:', project.id);
        
        // También guardar en localStorage como backup
        const allProjects = getAllProjects();
        allProjects.push(project);
        saveAllProjects(allProjects);
        
        return project;
      } catch (error) {
        console.warn('⚠️ Error creando en Firebase, usando localStorage:', error);
      }
    }
    
    // Fallback a localStorage
    const project: Project = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      ...projectData
    };

    const allProjects = getAllProjects();
    allProjects.push(project);
    saveAllProjects(allProjects);

    return project;
  },

  async updateProjectTitle(projectId: string, title: string): Promise<Project> {
    // Intentar usar Firebase primero
    if (isFirebaseAvailable()) {
      try {
        const projectRef = doc(db!, 'projects', projectId);
        await updateDoc(projectRef, {
          title,
          updated_at: new Date().toISOString()
        });
        
        console.log('✅ Proyecto actualizado en Firebase:', projectId);
      } catch (error) {
        console.warn('⚠️ Error actualizando en Firebase:', error);
      }
    }
    
    // También actualizar en localStorage
    const allProjects = getAllProjects();
    const projectIndex = allProjects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }

    allProjects[projectIndex].title = title;
    allProjects[projectIndex].updated_at = new Date().toISOString();
    
    saveAllProjects(allProjects);
    
    return allProjects[projectIndex];
  },

  async deleteProject(projectId: string): Promise<boolean> {
    // Intentar usar Firebase primero
    if (isFirebaseAvailable()) {
      try {
        const projectRef = doc(db!, 'projects', projectId);
        await deleteDoc(projectRef);
        
        console.log('✅ Proyecto eliminado de Firebase:', projectId);
      } catch (error) {
        console.warn('⚠️ Error eliminando de Firebase:', error);
      }
    }
    
    // También eliminar de localStorage
    const allProjects = getAllProjects();
    const filteredProjects = allProjects.filter(p => p.id !== projectId);
    
    saveAllProjects(filteredProjects);

    // También eliminar datos relacionados en localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`canvas-${projectId}`);
      localStorage.removeItem(`moodboard-${projectId}`);
      localStorage.removeItem(`mindmap-${projectId}`);
    }

    return true;
  },
};

export default projectService;
