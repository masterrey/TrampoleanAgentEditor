'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">✍️ Meus Projetos</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Bem-vindo, {session?.user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            {session?.user?.image && (
              <Image src={session.user.image} alt={session.user.name || ''} width={40} height={40} className="rounded-full" />
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nenhum projeto ainda</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Crie seu primeiro projeto ou abra um existente do Google Drive
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors">
              + Novo Projeto
            </button>
            <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors">
              Abrir do Drive
            </button>
          </div>
        </div>

        {/* Info Divider */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl mb-2">☁️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Salvo na Nuvem</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Seus projetos são salvos automaticamente no Google Drive
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">IA Integrada</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Obtenha sugestões de review, reescrita e continuação com IA
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl mb-2">⏱️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Histórico</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Volte a qualquer versão anterior do seu trabalho
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
