'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import {
  FiHome,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMessageSquare,
  FiCalendar,
  FiCreditCard,
  FiMenu,
  FiX,
  FiZap,
  FiTrendingUp
} from 'react-icons/fi'
import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaInstagram,
  FaFacebook
} from 'react-icons/fa'
import { logout } from '@/utils/auth'

export default function Sidebar() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    // Use the proper logout function
    await logout()
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-80 flex flex-col justify-between bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border-r border-white/20 shadow-2xl h-screen z-50 transition-all duration-500 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header Section */}
        <div className="p-8 flex-shrink-0">
          {/* Logo Section */}
          <div className="flex items-center justify-center mb-12">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-1 shadow-2xl">
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                  <img
                    src="/logo2.jpeg"
                    alt="Logo"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-3">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                Navigation
              </h3>
              <div className="space-y-2">
                <SidebarLink icon={<FiHome />} text="Accueil" href="/dashboard" onClick={toggleMobileMenu} />
                <SidebarLink icon={<FiMessageSquare />} text="Discussions" href="/all" onClick={toggleMobileMenu} />
                <SidebarLink icon={<FiCalendar />} text="Réunions" href="/meetings" onClick={toggleMobileMenu} />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                Compte
              </h3>
              <div className="space-y-2">
                <SidebarLink icon={<FiCreditCard />} text="Paiement" href="/payment" onClick={toggleMobileMenu} />
                <SidebarLink icon={<FiUser />} text="Profil" href="/profile" onClick={toggleMobileMenu} />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-white">Statistiques</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Entretiens</span>
                  <span className="text-xs font-semibold text-emerald-400">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Score moyen</span>
                  <span className="text-xs font-semibold text-emerald-400">85%</span>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Footer Section */}
        <div className="p-2 border-t border-white/10 flex-shrink-0">
          {/* Logout Button */}
          <button
            onClick={() => {
              handleLogout()
              toggleMobileMenu()
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-gray-500/20 to-gray-600/20 hover:from-gray-500/30 hover:to-gray-600/30 border border-gray-500/30 text-white text-sm font-medium transition-all duration-300 hover:scale-105 group mb-8"
          >
            <span className="text-lg group-hover:rotate-12 transition-transform duration-300">
              <FiLogOut />
            </span>
            <span>Déconnexion</span>
          </button>

          {/* Social Links */}
          <div className="space-y-4 mb-6">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
              Suivez-nous
            </h4>
            <div className="flex justify-center gap-3">
              <SocialIcon href="https://linkedin.com" icon={<FaLinkedin />} />
              <SocialIcon href="https://github.com" icon={<FaGithub />} />
              <SocialIcon href="https://twitter.com" icon={<FaTwitter />} />
              <SocialIcon href="https://instagram.com" icon={<FaInstagram />} />
              <SocialIcon href="https://facebook.com" icon={<FaFacebook />} />
            </div>
          </div>

          {/* Version Info */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Interv-ia v1.0.0
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

function SidebarLink({ 
  icon, 
  text, 
  href, 
  onClick 
}: { 
  icon: React.ReactNode
  text: string
  href: string
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-500/20 border border-transparent hover:border-emerald-500/30 text-white text-sm font-medium transition-all duration-300 hover:scale-105 relative overflow-hidden"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-300 rounded-xl"></div>
      
      {/* Icon */}
      <span className="relative z-10 text-lg group-hover:text-emerald-400 transition-colors duration-300 group-hover:scale-110">
        {icon}
      </span>
      
      {/* Text */}
      <span className="relative z-10 group-hover:text-white transition-colors duration-300">
        {text}
      </span>
      
      {/* Hover indicator */}
      <div className="absolute right-3 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-150"></div>
    </Link>
  )
}

function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 bg-white/10 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-500/20 text-white hover:text-emerald-400 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/10 hover:border-emerald-500/30 group"
    >
      <span className="group-hover:scale-110 transition-transform duration-300">
        {icon}
      </span>
    </a>
  )
}
