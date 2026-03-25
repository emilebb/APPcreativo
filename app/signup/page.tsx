'use client'
import AuthForm from '@/components/auth/AuthForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <AuthForm initialMode="signup" />
    </div>
  )
}