import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, logout } from '@/utils/auth'
import { FiLogOut, FiUser } from 'react-icons/fi'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <FiUser className="mr-2" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <FiLogOut className="mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
} 