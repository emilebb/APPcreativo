'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/authProvider'
import AuthGuard from '@/components/auth/AuthGuard'

import AuthForm from '@/components/auth/AuthForm'

function LoginContent() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <AuthForm initialMode="login" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    }>
      <AuthGuard requireAuth={false} redirectTo="/explore">
        <LoginContent />
      </AuthGuard>
    </Suspense>
  )
}