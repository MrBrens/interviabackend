'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiMail, FiLock, FiArrowLeft } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { setAuthToken, setUserData } from '@/utils/auth'
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [typedMessage, setTypedMessage] = useState('')
  const router = useRouter()

  // Use the page metadata hook
  usePageMetadata(PAGE_METADATA.LOGIN)

  const fullMessage = 'Bonjour 👋, connectons-nous pour démarrer ton entretien !'

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setTypedMessage(fullMessage.slice(0, i + 1))
      i++
      if (i >= fullMessage.length) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = async () => {
    setError('')
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
  
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        setError(data.message || 'Email ou mot de passe invalide.')
      } else {
        setAuthToken(data.token)
        setUserData(data.user)
        // Redirect based on user role
        if (data.user.role === 'admin') {
          router.push('/admin/users')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err) {
      console.error(err)
      setError("Erreur de connexion au serveur.")
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans relative">
      {/* Left Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center w-full md:w-1/2 p-10"
      >
        <div className="bg-white text-slate-900 shadow-2xl rounded-3xl p-10 w-full max-w-md relative z-10">
          {/* Back to Home Button */}
       

          <div className="text-center mb-8">
            <img src="/logo.png" alt="Logo" className="mx-auto w-32 h-auto mb-4 drop-shadow-md" />
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 text-transparent bg-clip-text">
              Connexion
            </h1>
          </div>
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-slate-700 transition-colors duration-300 mb-6 group"
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-sm font-medium">Retour à l'accueil</span>
          </motion.button>
          {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}

          <div className="space-y-5">
            <InputField
              icon={<FiMail />}
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              icon={<FiLock />}
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold transition duration-300 shadow-lg ${
                loading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
              }`}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </motion.button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Vous n'avez pas de compte ?{' '}
            <a href="/register" className="text-teal-500 font-medium hover:underline">
              Créez-en un ici
            </a>
          </p>
        </div>
      </motion.div>

      {/* Right Side - Bot Avatar + Typing Message */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex w-1/2 items-center justify-center p-10 flex-col relative z-0"
      >
        <motion.div
          className="rounded-full overflow-hidden w-52 h-52 border-[6px] border-emerald-400 shadow-xl mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <img
            src="https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg"
            alt="IntervBot"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          className="bg-white/10 border border-white/20 px-6 py-4 rounded-xl text-lg backdrop-blur-md text-white shadow-xl min-h-[60px] w-full max-w-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span>{typedMessage}</span>
          <motion.span className="inline-block w-1 h-5 bg-white ml-1 animate-pulse" />
        </motion.div>
      </motion.div>

      {/* Full-screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white text-slate-900 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 font-semibold text-lg">
            <svg
              className="animate-spin h-6 w-6 text-slate-900"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            Connexion en cours...
          </div>
        </div>
      )}
    </div>
  )
}

// Reusable input field component
function InputField({
  icon,
  type,
  placeholder,
  value,
  onChange
}: {
  icon: React.ReactNode
  type: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="flex items-center border border-gray-300 rounded-xl px-5 py-3 bg-white focus-within:ring-2 focus-within:ring-teal-500">
      <span className="text-gray-500 mr-3 text-lg">{icon}</span>
      <input
        type={type}
        className="flex-1 bg-transparent outline-none text-sm text-slate-900"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}
