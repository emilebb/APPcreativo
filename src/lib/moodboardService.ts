import { db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

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
  user_id: string;
  layout: string;
  images: MoodboardImage[];
  createdAt: string;
  updatedAt: string;
}

// Verificar si Firebase está disponible
function isFirebaseAvailable(): boolean {
  return typeof window !== 'undefined' && db !== undefined;
}

// Clave de localStorage para moodboards
const MOODBOARDS_KEY = 'creationx_moodboards';

const moodboardService = {
  async getMoodboard(id: string): Promise<Moodboard | null> {
    if (typeof window === 'undefined') return null;
    
    // Intentar Firebase primero
    if (isFirebaseAvailable()) {
      try {
        const moodboardRef = doc(db!, 'moodboards', id);
        const docSnap = await getDoc(moodboardRef);
        
        if (docSnap.exists()) {
          console.log('✅ Moodboard cargado desde Firebase:', id);
          return { id: docSnap.id, ...docSnap.data() } as Moodboard;
        }
      } catch (error) {
        console.warn('⚠️ Error cargando desde Firebase:', error);
      }
    }
    
    // Fallback a localStorage
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
    
    // Sincronizar a Firebase
    if (isFirebaseAvailable()) {
      try {
        const moodboardRef = doc(db!, 'moodboards', moodboard.id);
        await setDoc(moodboardRef, {
          ...moodboard,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log('✅ Moodboard guardado en Firebase:', moodboard.id);
      } catch (error) {
        console.warn('⚠️ Error guardando en Firebase:', error);
      }
    }
    
    // Siempre guardar en localStorage como backup
    try {
      localStorage.setItem(`moodboard-${moodboard.id}`, JSON.stringify({
        ...moodboard,
        updatedAt: new Date().toISOString()
      }));
      
      // Actualizar lista de moodboards en localStorage
      const allMoodboards = this.getAllMoodboardsFromStorage();
      const existingIndex = allMoodboards.findIndex(m => m.id === moodboard.id);
      if (existingIndex >= 0) {
        allMoodboards[existingIndex] = { ...moodboard, updatedAt: new Date().toISOString() };
      } else {
        allMoodboards.push({ ...moodboard, updatedAt: new Date().toISOString() });
      }
      localStorage.setItem(MOODBOARDS_KEY, JSON.stringify(allMoodboards));
      
      return true;
    } catch (error) {
      console.error("Error saving moodboard to localStorage:", error);
      return false;
    }
  },

  async getMoodboardsByUser(userId: string): Promise<Moodboard[]> {
    if (typeof window === 'undefined') return [];
    
    // Intentar Firebase primero
    if (isFirebaseAvailable()) {
      try {
        const moodboardsRef = collection(db!, 'moodboards');
        const q = query(moodboardsRef, where('user_id', '==', userId));
        const querySnapshot = await getDocs(q);
        
        const moodboards: Moodboard[] = [];
        querySnapshot.forEach((doc) => {
          moodboards.push({ id: doc.id, ...doc.data() } as Moodboard);
        });
        
        console.log('✅ Moodboards cargados desde Firebase:', moodboards.length);
        return moodboards.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      } catch (error) {
        console.warn('⚠️ Error cargando moodboards desde Firebase:', error);
      }
    }
    
    // Fallback a localStorage
    return this.getAllMoodboardsFromStorage()
      .filter(m => m.user_id === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  getAllMoodboardsFromStorage(): Moodboard[] {
    try {
      const stored = localStorage.getItem(MOODBOARDS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  async getAllMoodboards(): Promise<Moodboard[]> {
    if (typeof window === 'undefined') return [];
    
    // Intentar Firebase primero
    if (isFirebaseAvailable()) {
      try {
        const moodboardsRef = collection(db!, 'moodboards');
        const querySnapshot = await getDocs(moodboardsRef);
        
        const moodboards: Moodboard[] = [];
        querySnapshot.forEach((doc) => {
          moodboards.push({ id: doc.id, ...doc.data() } as Moodboard);
        });
        
        return moodboards.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      } catch (error) {
        console.warn('⚠️ Error cargando todos los moodboards:', error);
      }
    }
    
    return this.getAllMoodboardsFromStorage()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async deleteMoodboard(id: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    // Eliminar de Firebase
    if (isFirebaseAvailable()) {
      try {
        await deleteDoc(doc(db!, 'moodboards', id));
        console.log('✅ Moodboard eliminado de Firebase:', id);
      } catch (error) {
        console.warn('⚠️ Error eliminando de Firebase:', error);
      }
    }
    
    // Eliminar de localStorage
    try {
      localStorage.removeItem(`moodboard-${id}`);
      
      // Actualizar lista en localStorage
      const allMoodboards = this.getAllMoodboardsFromStorage()
        .filter(m => m.id !== id);
      localStorage.setItem(MOODBOARDS_KEY, JSON.stringify(allMoodboards));
      
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
