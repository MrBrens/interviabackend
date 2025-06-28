'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiHome, FiUser, FiSettings, FiCreditCard, FiLogOut, FiMessageSquare, FiCalendar, FiMic } from 'react-icons/fi'
import { FaLinkedin, FaGithub, FaTwitter } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'
import Sidebar from '../components/Sidebar'
import { getAuthToken } from '@/utils/auth'
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata'

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Use the page metadata hook
  usePageMetadata(PAGE_METADATA.PROFILE)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || ''
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
        fetchUserData() // Refresh user data
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' })
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const currentPassword = form.currentPassword.value
    const newPassword = form.newPassword.value
    const confirmPassword = form.confirmPassword.value

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' })
        form.reset()
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la modification du mot de passe' })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la modification du mot de passe' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans">
        <Sidebar />
        <main className="flex-1 p-10 text-white ml-80">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 md:ml-80 mt-2.5 sm:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Profil
              </span>
            </h1>
            <p className="text-gray-300">
              Gérez vos informations personnelles et votre mot de passe
            </p>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl mb-6 ${
                message.type === 'success' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Informations personnelles</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Numéro de téléphone</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder={formData.phoneNumber || "+33 6 12 34 56 78"}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-all duration-300"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-emerald-400 text-white font-semibold rounded-lg hover:bg-teal-400 transition"
                >
                  Mettre à jour
                </button>
              </form>
            </motion.div>

            {/* Password Change */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Changer le mot de passe</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Mot de passe actuel</label>
                  <input
                    type="password"
                    name="currentPassword"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Nouveau mot de passe</label>
                  <input
                    type="password"
                    name="newPassword"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-all duration-300"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-emerald-400 text-white font-semibold rounded-lg hover:bg-teal-400 transition"
                >
                  Changer le mot de passe
                </button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

// ✅ Reusable Input component
function Input({
  type = 'text',
  name,
  value,
  onChange,
  placeholder
}: {
  type?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="px-4 py-3 rounded-md bg-white/10 border border-white/20 w-full placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-[#14CF93] transition"
    />
  )
}
