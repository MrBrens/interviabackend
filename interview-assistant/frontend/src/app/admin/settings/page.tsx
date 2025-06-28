'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { getUserData } from '@/utils/auth';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar,
  Edit,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata';

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  // Use the page metadata hook
  usePageMetadata(PAGE_METADATA.ADMIN_SETTINGS);

  useEffect(() => {
    // Check if user is logged in and has admin role
    const userData = getUserData();
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (!userData || userData.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setUser(userData);
    setFormData({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || ''
    });
  }, [router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Échec de la mise à jour du profil');
      }

      const updatedUser = await response.json();
      
      // Update local storage with new user data
      const updatedUserData = { ...user, ...updatedUser.user };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      setUser(updatedUserData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Échec de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
          <p className="text-gray-600">Chargement des informations du compte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-72">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Paramètres du Compte</h1>
            <p className="mt-2 text-gray-600">
              Gérez les informations de votre compte administrateur
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Informations du Compte
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:text-green-900"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:text-green-900 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Enregistrer
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Entrez votre prénom"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{user.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de Famille
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Entrez votre nom de famille"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{user.lastName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Entrez votre adresse email"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{user.email}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle
                  </label>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-green-600 mr-2" />
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {user.role === 'admin' ? 'Administrateur' : user.role}
                    </span>
                  </div>
                </div>

                {/* User ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Utilisateur
                  </label>
                  <p className="text-sm text-gray-900 font-mono">{user.id}</p>
                </div>

                {/* Account Created */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compte Créé
                  </label>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Security Note */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Sécurité du Compte</h3>
                <p className="text-sm text-blue-700 mt-1">
                  En tant qu'utilisateur administrateur, votre compte a un accès complet pour gérer l'application. 
                  Gardez vos identifiants sécurisés et contactez le support si vous devez changer votre mot de passe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 