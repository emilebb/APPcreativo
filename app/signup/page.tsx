'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { testSupabaseConnection } from '@/lib/supabaseTest'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    
    setLoading(true)
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: {
          user_name: email.split('@')[0],
          app_name: 'CreationX'
        }
      },
    })

    if (error) {
      console.error('Supabase signUp error:', error)
      setError(`Error: ${error.message} (Código: ${error.status || 'desconocido'})`)
    } else {
      alert('¡Revisa tu correo para confirmar tu cuenta!')
      router.push('/login')
    }
    setLoading(false)
  }

  const handleDiagnostic = async () => {
    setDiagnosticResult('Ejecutando diagnóstico...')
    try {
      const result = await testSupabaseConnection()
      setDiagnosticResult(JSON.stringify(result, null, 2))
      console.log('Diagnóstico Supabase:', result)
    } catch (err) {
      setDiagnosticResult(`Error en diagnóstico: ${err}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.1)]">
        <h1 className="text-4xl font-extrabold text-white mb-2 text-center tracking-tight">Únete a CreationX</h1>
        <p className="text-gray-400 text-center mb-10 text-sm">Empieza a diseñar tu visión creativa hoy.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1 mb-2 block">Email Corporativo / Personal</label>
            <input 
              type="email" 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all"
              placeholder="creativo@rbr.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1 mb-2 block">Contraseña Maestra</label>
            <input 
              type="password" 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all"
              placeholder="Mínimo 8 caracteres"
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1 mb-2 block">Confirmar Contraseña</label>
            <input 
              type="password" 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all"
              placeholder="Repite tu contraseña"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-violet-900/20"
          >
            {loading ? 'Procesando...' : 'Crear Cuenta Pro'}
          </button>
        </form>
        <p className="mt-8 text-center text-gray-500 text-sm">
          ¿Ya tienes cuenta? <Link href="/login" className="text-violet-400 hover:underline">Inicia sesión</Link>
        </p>
        
        {/* Botón de diagnóstico */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={handleDiagnostic}
            className="w-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-300 font-medium py-3 rounded-xl transition-all text-sm"
          >
            🔍 Diagnosticar Conexión Supabase
          </button>
          
          {diagnosticResult && (
            <div className="mt-4 p-4 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-gray-400 max-h-40 overflow-y-auto">
              <pre>{diagnosticResult}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}