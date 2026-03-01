'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'

function LoginContent() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const error_param = searchParams.get('error')

  useEffect(() => {
    if (error_param) {
      setError('Erro ao fazer login. Tente novamente.')
    }
  }, [error_param])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('google', {
        redirect: true,
        callbackUrl: '/dashboard',
      })

      if (result?.error) {
        setError('Erro ao autenticar com Google. Tente novamente.')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('[Login] Error:', err)
      setError('Erro inesperado. Tente novamente.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ✍️ TrampoleanAgent
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Editor inteligente com IA para suas teses e livros
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-2 border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 font-semibold text-gray-900 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Conectando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Entrar com Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 bg-gray-300 dark:bg-gray-600 h-px" />
            <span className="text-gray-500 dark:text-gray-400 text-sm">ou</span>
            <div className="flex-1 bg-gray-300 dark:bg-gray-600 h-px" />
          </div>

          {/* Info */}
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-lg">✓</span>
              <span>Salve suas teses e livros na nuvem</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">✓</span>
              <span>IA integrada para review e reescrita</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">✓</span>
              <span>Histórico de versões automático</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ao fazer login, você concorda com nossa{' '}
              <Link href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  )
}
