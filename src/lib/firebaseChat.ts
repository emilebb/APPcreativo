/**
 * Firebase Chat Service
 * Gestiona mensajes del chat en Firestore
 */

import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

export interface ChatMessage {
  role: 'user' | 'system';
  content: string;
  timestamp: number;
  actionType?: string;
  hasAction?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  metadata?: {
    lastIntent?: string;
    lastBlockage?: string;
    momentum?: number;
  };
}

/**
 * Guarda un mensaje en Firestore
 */
export async function saveMessage(
  userId: string, 
  chatId: string, 
  message: ChatMessage
): Promise<void> {
  if (!db) {
    console.warn('Firestore no disponible, usando localStorage');
    return;
  }

  try {
    const chatRef = doc(db, 'users', userId, 'chats', chatId);

    await setDoc(
      chatRef,
      {
        messages: arrayUnion({
          ...message,
          timestamp: message.timestamp || Date.now(),
        }),
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error guardando mensaje:', error);
    throw error;
  }
}

/**
 * Crea o actualiza una sesión de chat
 */
export async function createChatSession(
  userId: string,
  chatId: string,
  metadata?: ChatSession['metadata']
): Promise<void> {
  if (!db) return;

  try {
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      await setDoc(chatRef, {
        id: chatId,
        userId,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: metadata || {},
      });
    }
  } catch (error) {
    console.error('Error creando sesión de chat:', error);
  }
}

/**
 * Actualiza metadata de la sesión de chat
 */
export async function updateChatMetadata(
  userId: string,
  chatId: string,
  metadata: ChatSession['metadata']
): Promise<void> {
  if (!db) return;

  try {
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    
    await updateDoc(chatRef, {
      metadata,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error actualizando metadata:', error);
  }
}

/**
 * Obtiene mensajes de un chat
 */
export async function getChatMessages(
  userId: string,
  chatId: string
): Promise<ChatMessage[]> {
  if (!db) return [];

  try {
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (chatDoc.exists()) {
      const data = chatDoc.data() as ChatSession;
      return data.messages || [];
    }

    return [];
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    return [];
  }
}

/**
 * Listener en tiempo real para mensajes del chat
 */
export function subscribeToChatMessages(
  userId: string,
  chatId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  if (!db) {
    return () => {};
  }

  const chatRef = doc(db, 'users', userId, 'chats', chatId);

  const unsubscribe = onSnapshot(chatRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as ChatSession;
      callback(data.messages || []);
    }
  });

  return unsubscribe;
}
