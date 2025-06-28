'use client'

import React from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/utils/auth'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Use the proper logout function
    logout()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B243A] text-white font-sans">
      <p className="text-lg animate-pulse">Déconnexion en cours...</p>
    </div>
  )
}
