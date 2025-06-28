'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiHome, FiArrowLeft, FiSearch } from 'react-icons/fi'
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata'

export default function NotFound() {
  // Use the page metadata hook
  usePageMetadata({
    title: 'Page non trouvée | Interv-ia',
    description: 'La page que vous recherchez n\'existe pas.',
    icon: '/logo2.jpeg'
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="text-center p-8 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-1 shadow-2xl">
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                  <img
                    src="/logo2.jpeg"
                    alt="Logo"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
          </div>

          {/* Error Code */}
          <motion.h1
            className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-4"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            404
          </motion.h1>

          {/* Error Message */}
          <h2 className="text-2xl font-bold mb-4">Page non trouvée</h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée. 
            Vérifiez l'URL ou utilisez les liens ci-dessous pour naviguer.
          </p>

          {/* Search Icon Animation */}
          <motion.div
            className="flex justify-center mb-8"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <FiSearch className="w-8 h-8 text-emerald-400" />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <FiHome className="w-5 h-5" />
              Retour au tableau de bord
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300"
            >
              <FiArrowLeft className="w-5 h-5" />
              Page précédente
            </button>
          </div>

          {/* Additional Links */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-sm text-gray-400 mb-4">Ou naviguez vers :</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
              >
                Inscription
              </Link>
              <Link
                href="/payment"
                className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
              >
                Plans
              </Link>
              <Link
                href="/all"
                className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
              >
                Discussions
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 