"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function handleCallback() {
      try {
        if (!supabase) {
          setStatus("error");
          setMessage("Supabase no está configurado.");
          return;
        }

        // Get the session after email confirmation
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          setStatus("error");
          setMessage("No pudimos confirmar tu cuenta. Intenta de nuevo.");
          return;
        }

        setStatus("success");
        setMessage("¡Cuenta confirmada!");

        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (err) {
        setStatus("error");
        setMessage("Algo salió mal. Intenta de nuevo.");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <div className="space-y-4">
        {status === "loading" && (
          <>
            <div className="text-4xl">⏳</div>
            <p className="text-neutral-600">Confirmando tu cuenta...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-4xl">✓</div>
            <p className="text-lg font-semibold text-neutral-900">
              {message}
            </p>
            <p className="text-sm text-neutral-500">
              Te redirigimos a la app...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-4xl">⚠️</div>
            <p className="text-neutral-700">{message}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 rounded-lg bg-neutral-900 px-6 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Volver a la app
            </button>
          </>
        )}
      </div>
    </main>
  );
}
