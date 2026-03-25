"use client";

import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <title>CreacionX - Plataforma Creativa Inteligente</title>
        <meta name="description" content="Plataforma creativa inteligente para diseñadores y desarrolladores" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-[#0d0d10] text-white antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
