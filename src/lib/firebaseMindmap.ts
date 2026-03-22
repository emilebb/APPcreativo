/**
 * Firebase Mindmap Service
 * Gestiona nodos y conexiones de mapas mentales en Firestore
 */

import { db } from './firebase';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';

export interface MindmapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  createdAt: number;
  fromChat?: boolean;
  chatMessageId?: string;
}

export interface MindmapEdge {
  id: string;
  from: string;
  to: string;
  createdAt: number;
}

export interface Mindmap {
  id: string;
  userId: string;
  title: string;
  nodes: MindmapNode[];
  edges: MindmapEdge[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Crea un nodo en el mapa mental
 */
export async function createNode(
  userId: string,
  mapId: string,
  nodeData: Omit<MindmapNode, 'id' | 'createdAt'>
): Promise<string> {
  if (!db) {
    console.warn('Firestore no disponible');
    return '';
  }

  try {
    const nodesRef = collection(db, 'users', userId, 'maps', mapId, 'nodes');

    const docRef = await addDoc(nodesRef, {
      ...nodeData,
      x: nodeData.x || Math.random() * 300,
      y: nodeData.y || Math.random() * 500,
      createdAt: Date.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creando nodo:', error);
    throw error;
  }
}

/**
 * Crea una conexión entre nodos
 */
export async function createEdge(
  userId: string,
  mapId: string,
  edgeData: Omit<MindmapEdge, 'id' | 'createdAt'>
): Promise<string> {
  if (!db) return '';

  try {
    const edgesRef = collection(db, 'users', userId, 'maps', mapId, 'edges');

    const docRef = await addDoc(edgesRef, {
      ...edgeData,
      createdAt: Date.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creando conexión:', error);
    throw error;
  }
}

/**
 * Actualiza un nodo existente
 */
export async function updateNode(
  userId: string,
  mapId: string,
  nodeId: string,
  updates: Partial<MindmapNode>
): Promise<void> {
  if (!db) return;

  try {
    const nodeRef = doc(db, 'users', userId, 'maps', mapId, 'nodes', nodeId);
    await updateDoc(nodeRef, updates);
  } catch (error) {
    console.error('Error actualizando nodo:', error);
  }
}

/**
 * Elimina un nodo
 */
export async function deleteNode(
  userId: string,
  mapId: string,
  nodeId: string
): Promise<void> {
  if (!db) return;

  try {
    const nodeRef = doc(db, 'users', userId, 'maps', mapId, 'nodes', nodeId);
    await deleteDoc(nodeRef);
  } catch (error) {
    console.error('Error eliminando nodo:', error);
  }
}

/**
 * Obtiene todos los nodos de un mapa
 */
export async function getNodes(
  userId: string,
  mapId: string
): Promise<MindmapNode[]> {
  if (!db) return [];

  try {
    const nodesRef = collection(db, 'users', userId, 'maps', mapId, 'nodes');
    const q = query(nodesRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MindmapNode[];
  } catch (error) {
    console.error('Error obteniendo nodos:', error);
    return [];
  }
}

/**
 * Obtiene todas las conexiones de un mapa
 */
export async function getEdges(
  userId: string,
  mapId: string
): Promise<MindmapEdge[]> {
  if (!db) return [];

  try {
    const edgesRef = collection(db, 'users', userId, 'maps', mapId, 'edges');
    const snapshot = await getDocs(edgesRef);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MindmapEdge[];
  } catch (error) {
    console.error('Error obteniendo conexiones:', error);
    return [];
  }
}

/**
 * Listener en tiempo real para nodos
 */
export function subscribeToNodes(
  userId: string,
  mapId: string,
  callback: (nodes: MindmapNode[]) => void
): () => void {
  if (!db) {
    return () => {};
  }

  const nodesRef = collection(db, 'users', userId, 'maps', mapId, 'nodes');
  const q = query(nodesRef, orderBy('createdAt', 'asc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const nodes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MindmapNode[];

    callback(nodes);
  });

  return unsubscribe;
}

/**
 * Listener en tiempo real para conexiones
 */
export function subscribeToEdges(
  userId: string,
  mapId: string,
  callback: (edges: MindmapEdge[]) => void
): () => void {
  if (!db) {
    return () => {};
  }

  const edgesRef = collection(db, 'users', userId, 'maps', mapId, 'edges');

  const unsubscribe = onSnapshot(edgesRef, (snapshot) => {
    const edges = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MindmapEdge[];

    callback(edges);
  });

  return unsubscribe;
}

/**
 * Crea nodo automáticamente desde el chat
 */
export async function createNodeFromChat(
  userId: string,
  mapId: string,
  message: string,
  chatMessageId?: string,
  lastNodeId?: string
): Promise<string> {
  if (!db) return '';

  try {
    // Crear el nodo
    const nodeId = await createNode(userId, mapId, {
      text: message,
      x: Math.random() * 400 + 100,
      y: Math.random() * 400 + 100,
      fromChat: true,
      chatMessageId,
    });

    // Si hay un nodo anterior, crear conexión
    if (lastNodeId && nodeId) {
      await createEdge(userId, mapId, {
        from: lastNodeId,
        to: nodeId,
      });
    }

    return nodeId;
  } catch (error) {
    console.error('Error creando nodo desde chat:', error);
    return '';
  }
}
