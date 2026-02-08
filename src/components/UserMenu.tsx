"use client";
import { useEffect, useState } from "react";

export default function UserMenu({ user }: { user: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-bold">
        {user?.email || "Sin email"}
      </span>
      <button
        className="text-xs px-2 py-1 rounded bg-red-100 text-red-700"
        onClick={() => alert("Cerrar sesión (implementa aquí tu lógica)")}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
