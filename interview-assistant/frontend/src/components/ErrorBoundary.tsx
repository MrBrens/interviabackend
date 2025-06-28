'use client'

import React, { useState, useEffect, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

export default function ErrorBoundary({ children, fallback }: Props) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Error caught by boundary:', error)
      setError(error.error || new Error(error.message))
      setHasError(true)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event)
      setError(new Error(event.reason?.message || 'Unhandled promise rejection'))
      setHasError(true)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (hasError) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Une erreur s'est produite</h1>
          <p className="text-gray-300 mb-6">
            Désolé, quelque chose s'est mal passé. Veuillez rafraîchir la page ou réessayer plus tard.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
          >
            Rafraîchir la page
          </button>
          {error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-400">Détails de l'erreur</summary>
              <pre className="mt-2 text-xs text-red-400 bg-red-900/20 p-2 rounded overflow-auto">
                {error.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
} 