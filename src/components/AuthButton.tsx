"use client";

import { useState } from "react";
import { useAuth } from "@/lib/authProvider";
import AuthModal from "@/components/AuthModal";

export default function AuthButton() {
  const { session, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return null;
  }

  if (session) {
    return (
      <button
        onClick={() => {
          // TODO: logout
        }}
        className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
      >
        Salir
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-50"
      >
        Cuenta
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tu cuenta</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-neutral-900"
              >
                ✕
              </button>
            </div>

            <AuthModal onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
