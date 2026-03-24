import { db } from './firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, onSnapshot 
} from 'firebase/firestore';
import { CanvasElement, Project } from '@/stores/canvasStore';

// Verificar si Firebase está disponible
function isFirebaseAvailable(): boolean {
  return typeof window !== 'undefined' && db !== undefined;
}

// ============================================================================
// PROYECTOS
// ============================================================================

export const projectService = {
  /**
   * Obtener todos los proyectos de un usuario
   */
  async getProjects(userId: string, limitCount: number = 50): Promise<Project[]> {
    if (isFirebaseAvailable()) {
      try {
        const projectsRef = collection(db!, 'projects');
        const q = query(
          projectsRef,
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc'),
          limit(limitCount)
        );
        
        const querySnapshot = await getDocs(q);
        const projects: Project[] = [];
        
        querySnapshot.forEach((doc) => {
          projects.push({ id: doc.id, ...doc.data() } as Project);
        });
        
        console.log('✅ Proyectos cargados desde Firebase:', projects.length);
        return projects;
      } catch (error) {
        console.warn('⚠️ Error cargando desde Firebase:', error);
      }
    }
    
    // Fallback a localStorage
    return this.getProjectsFromStorage(userId);
  },

  /**
   * Obtener un proyecto específico
   */
  async getProject(projectId: string): Promise<Project | null> {
    if (isFirebaseAvailable()) {
      try {
        const projectRef = doc(db!, 'projects', projectId);
        const docSnap = await getDoc(projectRef);
        
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Project;
        }
      } catch (error) {
        console.warn('⚠️ Error cargando proyecto:', error);
      }
    }
    
    // Fallback a localStorage
    return this.getProjectFromStorage(projectId);
  },

  /**
   * Crear un nuevo proyecto
   */
  async createProject(userId: string, type: Project['type'] = 'canvas', title: string = 'Sin título'): Promise<Project> {
    const projectData: Omit<Project, 'id'> = {
      title,
      type,
      userId,
      elements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseAvailable()) {
      try {
        const projectsRef = collection(db!, 'projects');
        const docRef = await doc(projectsRef);
        
        await setDoc(docRef, projectData);
        
        const project: Project = { id: docRef.id, ...projectData };
        console.log('✅ Proyecto creado en Firebase:', project.id);
        
        // También guardar en localStorage
        this.saveProjectToStorage(project);
        
        return project;
      } catch (error) {
        console.warn('⚠️ Error creando en Firebase:', error);
      }
    }
    
    // Fallback a localStorage
    const project: Project = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...projectData,
    };
    
    this.saveProjectToStorage(project);
    return project;
  },

  /**
   * Guardar/actualizar un proyecto completo
   */
  async saveProject(project: Project): Promise<boolean> {
    const updatedProject = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseAvailable()) {
      try {
        const projectRef = doc(db!, 'projects', project.id);
        await setDoc(projectRef, updatedProject, { merge: true });
        console.log('✅ Proyecto guardado en Firebase:', project.id);
      } catch (error) {
        console.warn('⚠️ Error guardando en Firebase:', error);
      }
    }
    
    // Siempre guardar en localStorage
    this.saveProjectToStorage(updatedProject);
    return true;
  },

  /**
   * Actualizar solo los elementos de un proyecto
   */
  async updateProjectElements(projectId: string, elements: CanvasElement[]): Promise<boolean> {
    if (isFirebaseAvailable()) {
      try {
        const projectRef = doc(db!, 'projects', projectId);
        await updateDoc(projectRef, {
          elements,
          updatedAt: new Date().toISOString(),
        });
        console.log('✅ Elementos actualizados:', projectId);
      } catch (error) {
        console.warn('⚠️ Error actualizando elementos:', error);
      }
    }
    
    // Actualizar en localStorage
    const project = await this.getProject(projectId);
    if (project) {
      project.elements = elements;
      project.updatedAt = new Date().toISOString();
      this.saveProjectToStorage(project);
    }
    
    return true;
  },

  /**
   * Actualizar título de un proyecto
   */
  async updateProjectTitle(projectId: string, title: string): Promise<boolean> {
    if (isFirebaseAvailable()) {
      try {
        const projectRef = doc(db!, 'projects', projectId);
        await updateDoc(projectRef, {
          title,
          updatedAt: new Date().toISOString(),
        });
        console.log('✅ Título actualizado:', projectId);
      } catch (error) {
        console.warn('⚠️ Error actualizando título:', error);
      }
    }
    
    // Actualizar en localStorage
    const project = await this.getProject(projectId);
    if (project) {
      project.title = title;
      project.updatedAt = new Date().toISOString();
      this.saveProjectToStorage(project);
    }
    
    return true;
  },

  /**
   * Eliminar un proyecto
   */
  async deleteProject(projectId: string): Promise<boolean> {
    if (isFirebaseAvailable()) {
      try {
        const projectRef = doc(db!, 'projects', projectId);
        await deleteDoc(projectRef);
        console.log('✅ Proyecto eliminado de Firebase:', projectId);
      } catch (error) {
        console.warn('⚠️ Error eliminando de Firebase:', error);
      }
    }
    
    // Eliminar de localStorage
    this.deleteProjectFromStorage(projectId);
    return true;
  },

  /**
   * Suscribirse a cambios en tiempo real
   */
  subscribeToProjects(userId: string, callback: (projects: Project[]) => void): () => void {
    if (!isFirebaseAvailable()) {
      // Fallback a localStorage
      const projects = this.getProjectsFromStorage(userId);
      callback(projects);
      return () => {};
    }

    try {
      const projectsRef = collection(db!, 'projects');
      const q = query(
        projectsRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const projects: Project[] = [];
        snapshot.forEach((doc) => {
          projects.push({ id: doc.id, ...doc.data() } as Project);
        });
        callback(projects);
      });

      return unsubscribe;
    } catch (error) {
      console.warn('⚠️ Error suscribiendo a proyectos:', error);
      return () => {};
    }
  },

  // ============================================================================
  // HELPERS - LOCALSTORAGE
  // ============================================================================

  STORAGE_KEY: 'canvas_projects',

  getAllProjectsFromStorage(): Project[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveProjectToStorage(project: Project): void {
    if (typeof window === 'undefined') return;
    
    try {
      const projects = this.getAllProjectsFromStorage();
      const index = projects.findIndex((p) => p.id === project.id);
      
      if (index >= 0) {
        projects[index] = project;
      } else {
        projects.push(project);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error guardando proyecto en localStorage:', error);
    }
  },

  getProjectsFromStorage(userId: string): Project[] {
    return this.getAllProjectsFromStorage()
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  getProjectFromStorage(projectId: string): Project | null {
    const projects = this.getAllProjectsFromStorage();
    return projects.find((p) => p.id === projectId) || null;
  },

  deleteProjectFromStorage(projectId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const projects = this.getAllProjectsFromStorage()
        .filter((p) => p.id !== projectId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error eliminando proyecto de localStorage:', error);
    }
  },
};

export default projectService;
