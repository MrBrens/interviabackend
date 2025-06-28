'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, 
  Settings, 
  BarChart2, 
  MessageSquare,
  CreditCard,
  LogOut,
  User,
  Home
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { logout } from '@/utils/auth';

const menuItems = [
  {
    title: 'Tableau de bord',
    icon: BarChart2,
    href: '/admin'
  },
  {
    title: 'Utilisateurs',
    icon: Users,
    href: '/admin/users'
  },
  {
    title: 'Entretiens',
    icon: MessageSquare,
    href: '/admin/interviews'
  },
  {
    title: 'Plans',
    icon: CreditCard,
    href: '/admin/plans'
  },
  {
    title: 'Paiements',
    icon: CreditCard,
    href: '/admin/payment'
  },
  {
    title: 'Paramètres',
    icon: Settings,
    href: '/admin/settings'
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    // Use the proper logout function
    await logout();
  };

  return (
    <div className="h-screen w-72 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 fixed left-0 top-0 shadow-lg overflow-y-auto">
      <div className="p-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
          Administration
        </h1>
        <p className="text-sm text-gray-500 mt-1">Gérez votre application</p>
      </div>
      
      {/* User Profile Section */}
      {user && (
        <div className="px-6 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Link
                href="/"
                className="flex items-center text-xs text-gray-600 hover:text-green-600 transition-colors"
              >
                <Home className="w-3 h-3 mr-1" />
                Retour au site principal
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <nav className="mt-4">
        <div className="px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <button
                key={item.title}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                {item.title}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 w-full p-6 border-t border-gray-200 bg-white">
        <button
          className="flex items-center w-full px-4 py-3.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Déconnexion
        </button>
      </div>
    </div>
  );
} 