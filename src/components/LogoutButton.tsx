"use client";

import { useAuth } from "@/lib/authProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut();
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      // Redirigir al home
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {loading ? 'Cerrando...' : 'Cerrar sesión'}
    </button>
  );
}
