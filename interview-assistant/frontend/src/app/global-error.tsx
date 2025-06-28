'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
          <div className="text-center p-8 max-w-md mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-red-400">Erreur Critique</h1>
            <p className="text-gray-300 mb-6">
              Une erreur inattendue s'est produite. Veuillez réessayer.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
            >
              Réessayer
            </button>
            {error.digest && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-400">ID d'erreur</summary>
                <pre className="mt-2 text-xs text-red-400 bg-red-900/20 p-2 rounded">
                  {error.digest}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  )
} 