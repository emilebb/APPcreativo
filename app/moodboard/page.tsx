"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function MoodboardsPage() {
  const [moodboards] = useState([
    {
      id: "1",
      title: "Verano 2024",
      description: "Colores vibrantes y energía solar para proyectos de verano",
      images: ["https://images.unsplash.com/photo-1507525428034-b723a9ce6890?w=300&h=200&fit=crop"],
      tags: ["verano", "vibrante"],
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-20T15:45:00Z",
      color_palette: ["#FF6B6B", "#4ECDC4"],
      is_public: true
    }
  ]);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Moodboards
        </h1>
        <Link
          href="/moodboard/new"
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition"
        >
          <Plus className="w-4 h-4" />
          Nuevo Moodboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {moodboards.map((moodboard) => (
          <Link
            key={moodboard.id}
            href={`/moodboard/${moodboard.id}`}
            className="group block p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all"
          >
            <div className="aspect-video bg-neutral-100 dark:bg-neutral-700 rounded-lg mb-3 overflow-hidden">
              {moodboard.images[0] && (
                <img
                  src={moodboard.images[0]}
                  alt={moodboard.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              )}
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              {moodboard.title}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
              {moodboard.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
