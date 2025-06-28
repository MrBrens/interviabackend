'use client'

import { useState, useEffect } from 'react'
import { FiMail } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [typedMessage, setTypedMessage] = useState('')
  const fullMessage = '🔐 Réinitialisons ton mot de passe maintenant !'

  // Use the page metadata hook
  usePageMetadata(PAGE_METADATA.RESET_PASSWORD)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setTypedMessage(fullMessage.slice(0, i + 1))
      i++
      if (i >= fullMessage.length) clearInterval(interval)
    }, 45)
    return () => clearInterval(interval)
  }, [])

  const handleReset = () => {
    setError('')
    setSuccess('')

    if (!email) {
      setError('Veuillez entrer votre adresse email.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess("📩 Un lien de réinitialisation a été envoyé à votre email.")
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#0B243A] to-[#006F74] text-white">
      {/* Left - Form */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center w-full md:w-1/2 px-6 py-12"
      >
        <div className="bg-white text-[#0B243A] shadow-2xl rounded-3xl p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Interv-ia Logo" className="w-36 mx-auto mb-4 drop-shadow" />
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#0B243A] to-[#006F74] text-transparent bg-clip-text">
              Mot de passe oublié
            </h1>
          </div>

          {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}
          {success && <p className="text-sm text-green-600 text-center mb-4">{success}</p>}

          {/* Email Field */}
          <div className="flex items-center border border-gray-300 rounded-xl px-5 py-3 bg-white focus-within:ring-2 focus-within:ring-[#006F74]">
            <FiMail className="text-gray-500 mr-3 text-lg" />
            <input
              type="email"
              placeholder="Adresse email"
              className="flex-1 bg-transparent outline-none text-[#0B243A] text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            disabled={loading}
            className={`w-full mt-6 py-3 rounded-xl font-semibold transition duration-300 shadow-lg ${
              loading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-[#0B243A] to-[#006F74] text-white hover:opacity-90'
            }`}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </motion.button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Vous vous souvenez de votre mot de passe ?{' '}
            <a href="/login" className="text-[#006F74] font-medium hover:underline">
              Connectez-vous
            </a>
          </p>
        </div>
      </motion.div>

      {/* Right - Bot Typing Animation */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex w-1/2 p-6 items-center justify-center flex-col"
      >
        <motion.div
          className="rounded-full overflow-hidden w-52 h-52 border-[6px] border-[#14CF93] shadow-xl mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <img
            src="https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg"
            alt="Bot Avatar"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-white/10 border border-white/20 px-6 py-4 rounded-xl text-lg backdrop-blur-md text-white shadow-xl min-h-[60px] w-full max-w-xl"
        >
          <span>{typedMessage}</span>
          <motion.span className="inline-block w-1 h-5 bg-white ml-1 animate-pulse" />
        </motion.div>
      </motion.div>
    </div>
  )
}
