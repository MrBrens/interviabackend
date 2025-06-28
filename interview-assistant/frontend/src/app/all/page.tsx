'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import Link from 'next/link'
import { getAuthToken } from '@/utils/auth'
import { FiMessageSquare, FiCalendar, FiArrowRight, FiLoader } from 'react-icons/fi'
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata'

interface Discussion {
  id: number
  title: string
  lastMessageAt: string
  Messages: Array<{
    content: string
    createdAt: string
  }>
}

const DEEPSEEK_API_URL = 'https://api.deepseek.ai/v1/chat/completions'

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)

  // Use the page metadata hook
  usePageMetadata(PAGE_METADATA.CHAT)

  useEffect(() => {
    fetchDiscussions()
  }, [])

  const fetchDiscussions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discussions`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDiscussions(data)
      }
    } catch (error) {
      console.error('Error fetching discussions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans w-full">
      <Sidebar />

      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-10 overflow-y-auto w-full md:ml-80 mt-2.5 sm:mt-0">
        <motion.header
          className="mb-10 px-6 pt-10 pb-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              📁 Mes Discussions
            </span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 mt-2 font-medium">
            Consultez l'historique de vos simulations d'entretien passées.
          </p>
        </motion.header>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="col-span-full text-center py-10">
              <div className="flex items-center justify-center space-x-3">
                <FiLoader className="animate-spin h-8 w-8 text-emerald-400" />
                <span className="text-gray-300">Chargement des discussions...</span>
              </div>
            </div>
          ) : discussions.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <FiMessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg mb-2">Aucune discussion trouvée</p>
                <p className="text-gray-400 text-sm">Commencez votre première simulation d'entretien !</p>
              </div>
            </div>
          ) : (
            discussions.map((discussion, index) => (
              <motion.div
                key={discussion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <FiMessageSquare className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-gray-300 bg-white/10 px-3 py-1 rounded-full">
                      {formatDate(discussion.lastMessageAt)}
                    </span>
                  </div>

                  {/* Content */}
                  <h2 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors">
                    {discussion.title}
                  </h2>
                  
                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                    {discussion.Messages?.[0]?.content || 'Aucun message'}
                  </p>

                  {/* Action */}
                  <Link
                    href={`/chat?id=${discussion.id}`}
                    className="inline-flex items-center gap-2 text-emerald-400 text-sm font-semibold hover:text-emerald-300 transition-colors group-hover:gap-3"
                  >
                    <span>Reprendre</span>
                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </main>
    </div>
  )
}
