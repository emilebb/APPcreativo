"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";

export default function HomePage() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth || auth.loading) return;

    if (auth.user) {
      router.replace("/explore");
    } else {
      router.replace("/login");
    }
  }, [auth, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Cargando...</p>
    </div>
  );
}
