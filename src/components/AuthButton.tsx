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
        className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 hover:shadow-md"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
        Cuenta
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-50 hover:shadow-md"
      >
        <span>↗</span>
        Cuenta
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-2xl">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-neutral-900">
                Tu cuenta
              </h2>
              <p className="text-sm text-neutral-500">
                Guarda tu progreso para volver cuando lo necesites
              </p>
            </div>

            <AuthModal onClose={() => setIsOpen(false)} />

            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-6 top-6 text-neutral-400 transition hover:text-neutral-900"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
