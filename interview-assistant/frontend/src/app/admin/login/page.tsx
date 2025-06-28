'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiMail, FiLock, FiShield } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { setAuthToken } from '@/utils/auth'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    setError('')
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
  
    setLoading(true)
    try {
      console.log('Tentative de connexion au serveur...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
  
      console.log('Statut de réponse du serveur:', response.status)
      const data = await response.json()
      console.log('Données de réponse du serveur:', data)
  
      if (!response.ok) {
        setError(data.message || 'Email ou mot de passe invalide.')
      } else if (data.user.role !== 'admin') {
        setError('Accès refusé. Privilèges administrateur requis.')
      } else {
        // Store token and user data
        setAuthToken(data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/admin/users')
      }
    } catch (err) {
      console.error('Détails de l\'erreur de connexion:', err)
      setError("Impossible de se connecter au serveur. Veuillez vous assurer que le serveur fonctionne sur http://localhost:5050")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 mb-4">
            <FiShield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portail Administrateur</h1>
          <p className="text-gray-600">Connectez-vous pour accéder au tableau de bord administrateur</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email administrateur"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gray-900 hover:bg-gray-800'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                Connexion en cours...
              </div>
            ) : (
              'Se connecter'
            )}
          </motion.button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            <a href="/login" className="text-gray-900 hover:underline font-medium">
              Retour à la connexion principale
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
} 