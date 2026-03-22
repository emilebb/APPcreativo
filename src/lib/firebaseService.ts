import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Proyectos
export const projectsCollection = 'projects';

export const createProject = async (userId: string, projectData: any) => {
  if (!db) throw new Error('Firebase not initialized');
  const projectRef = doc(collection(db, projectsCollection));
  const project = {
    ...projectData,
    id: projectRef.id,
    user_id: userId,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now()
  };
  
  await setDoc(projectRef, project);
  return { ...project, id: projectRef.id };
};

export const getProjects = async (userId: string) => {
  if (!db) return [];
  const q = query(
    collection(db, projectsCollection),
    where('user_id', '==', userId),
    where('status', '==', 'active'),
    orderBy('updated_at', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateProject = async (projectId: string, updates: any) => {
  if (!db) throw new Error('Firebase not initialized');
  const projectRef = doc(db, projectsCollection, projectId);
  await updateDoc(projectRef, {
    ...updates,
    updated_at: Timestamp.now()
  });
};

export const deleteProject = async (projectId: string) => {
  const projectRef = doc(db, projectsCollection, projectId);
  await deleteDoc(projectRef);
};

// Moodboards
export const moodboardsCollection = 'moodboards';

export const saveMoodboard = async (moodboardId: string, userId: string, data: any) => {
  const moodboardRef = doc(db, moodboardsCollection, moodboardId);
  const moodboard = {
    ...data,
    id: moodboardId,
    user_id: userId,
    updated_at: Timestamp.now()
  };
  
  await setDoc(moodboardRef, moodboard, { merge: true });
  return moodboard;
};

export const getMoodboard = async (moodboardId: string) => {
  const moodboardRef = doc(db, moodboardsCollection, moodboardId);
  const snapshot = await getDoc(moodboardRef);
  
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
};

export const getAllMoodboards = async (userId: string) => {
  const q = query(
    collection(db, moodboardsCollection),
    where('user_id', '==', userId),
    orderBy('updated_at', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Perfiles
export const profilesCollection = 'profiles';

export const getProfile = async (userId: string) => {
  const profileRef = doc(db, profilesCollection, userId);
  const snapshot = await getDoc(profileRef);
  
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
};

export const createProfile = async (userId: string, profileData: any) => {
  const profileRef = doc(db, profilesCollection, userId);
  const profile = {
    ...profileData,
    id: userId,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now()
  };
  
  await setDoc(profileRef, profile);
  return profile;
};

export const updateProfile = async (userId: string, updates: any) => {
  const profileRef = doc(db, profilesCollection, userId);
  await updateDoc(profileRef, {
    ...updates,
    updated_at: Timestamp.now()
  });
};
