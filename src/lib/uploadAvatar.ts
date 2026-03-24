/**
 * uploadAvatar stub - usando base64 y localStorage
 * Reemplaza el uploadAvatar de Firebase Storage
 */

"use client";

export const uploadAvatar = async (
  file: File,
  userId: string
): Promise<string> => {
  // Convierte el archivo a base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Guarda en localStorage
      const key = `avatar-${userId}`;
      localStorage.setItem(key, base64);
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Error reading file"));
    reader.readAsDataURL(file);
  });
};

export const getAvatar = (userId: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`avatar-${userId}`);
};

export const deleteAvatar = (userId: string): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`avatar-${userId}`);
};

export default uploadAvatar;
