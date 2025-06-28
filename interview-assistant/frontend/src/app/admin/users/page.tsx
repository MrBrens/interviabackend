'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { adminService } from '@/services/adminService';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar,
  UserPlus,
  Download,
  Trash2,
  Edit2,
  Shield,
  Loader2,
  Save,
  X,
  Crown,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata';

interface Plan {
  id: number;
  name: string;
  price: number;
  duration: number;
  description: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
  interviews: number;
  subscription: {
    plan: {
      id: number;
      name: string;
      price: number;
    };
    startDate: string;
    endDate: string;
    status: string;
  } | null;
  joinDate: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('');
  const [editingSubscription, setEditingSubscription] = useState<{
    planId: number;
    duration: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<number | null>(null);
  const router = useRouter();

  // Use the page metadata hook
  usePageMetadata(PAGE_METADATA.ADMIN_USERS);

  useEffect(() => {
    // Check if user is logged in and has admin role
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [router]);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching users...');
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      console.log('Token:', token);

      if (!token) {
        throw new Error('Aucun token d\'authentification trouvé');
      }

      // Get user data to check if admin
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('User data:', userData);

      if (!userData || userData.role !== 'admin') {
        throw new Error('Privilèges d\'administrateur requis');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la récupération des utilisateurs');
      }

      const data = await response.json();
      console.log('✅ Received users:', data);

      setUsers(data.users);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Échec de la récupération des utilisateurs. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, [currentPage, searchTerm, selectedRole]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        console.log('Attempting to delete user with ID:', id);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Aucun token d\'authentification trouvé');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Delete response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Delete error response:', errorData);
          throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
        }

        console.log('User deleted successfully');
        
        // Remove the user from the local state
        setUsers(prev => prev.filter(user => user.id !== id));
        
        // Show success message
        alert('Utilisateur supprimé avec succès');
      } catch (err) {
        console.error('Error deleting user:', err);
        const errorMessage = err instanceof Error ? err.message : 'Échec de la suppression de l\'utilisateur';
        alert(`Erreur: ${errorMessage}`);
      }
    }
  };

  const handleAddUser = () => {
    router.push('/admin/users/create');
  };

  const handleEdit = (user: User) => {
    setEditingUser(user.id);
    setEditingStatus(user.role);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditingStatus('');
  };

  const handleSaveEdit = async (userId: number) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: editingStatus
        })
      });

      if (!response.ok) {
        throw new Error('Échec de la mise à jour de l\'utilisateur');
      }

      // Update the user in the local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: editingStatus }
          : user
      ));

      setEditingUser(null);
      setEditingStatus('');
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Échec de la mise à jour de l\'utilisateur. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubscriptionEdit = (user: User) => {
    setShowSubscriptionModal(user.id);
    setEditingSubscription({
      planId: user.subscription?.plan?.id || plans[0]?.id || 0,
      duration: 30
    });
  };

  const handleSaveSubscription = async (userId: number) => {
    if (!editingSubscription) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/subscription`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: editingSubscription.planId,
          duration: editingSubscription.duration
        })
      });

      if (!response.ok) {
        throw new Error('Échec de la mise à jour de l\'abonnement');
      }

      // Refresh users to get updated subscription data
      await fetchUsers();
      
      setShowSubscriptionModal(null);
      setEditingSubscription(null);
      alert('Abonnement mis à jour avec succès');
    } catch (err) {
      console.error('Error updating subscription:', err);
      alert('Échec de la mise à jour de l\'abonnement. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = async (userId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler l\'abonnement de cet utilisateur ?')) {
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/subscription`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Échec de l\'annulation de l\'abonnement');
      }

      // Refresh users to get updated subscription data
      await fetchUsers();
      
      setShowSubscriptionModal(null);
      setEditingSubscription(null);
      alert('Abonnement annulé avec succès');
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      alert('Échec de l\'annulation de l\'abonnement. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  const getSubscriptionStatus = (subscription: User['subscription']) => {
    if (!subscription) return { status: 'Aucun abonnement', color: 'bg-gray-100 text-gray-800' };
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    
    if (subscription.status === 'cancelled') {
      return { status: 'Annulé', color: 'bg-red-100 text-red-800' };
    }
    
    if (endDate < now) {
      return { status: 'Expiré', color: 'bg-orange-100 text-orange-800' };
    }
    
    return { status: 'Actif', color: 'bg-green-100 text-green-800' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-72">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
              <p className="mt-2 text-sm text-gray-600">Gérez et surveillez les comptes utilisateurs</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher des utilisateurs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">Tous les Rôles</option>
                <option value="admin">Administrateur</option>
                <option value="user">Utilisateur</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-600">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Abonnement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-green-600">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser === user.id ? (
                            <div className="flex items-center space-x-2">
                              <select
                                value={editingStatus}
                                onChange={(e) => setEditingStatus(e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
                              >
                                <option value="admin">Administrateur</option>
                                <option value="user">Utilisateur</option>
                              </select>
                              <button
                                onClick={() => handleSaveEdit(user.id)}
                                disabled={saving}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                {saving ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Save className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.subscription ? (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Crown className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium text-gray-900">
                                  {user.subscription.plan.name}
                                </span>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  getSubscriptionStatus(user.subscription).color
                                }`}>
                                  {getSubscriptionStatus(user.subscription).status}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>Expire le {formatDate(user.subscription.endDate)}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Aucun abonnement</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {editingUser === user.id ? (
                              <span className="text-gray-400">En cours...</span>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleEdit(user)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Modifier le rôle"
                                >
                                  <Shield className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleSubscriptionEdit(user)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Gérer l'abonnement"
                                >
                                  <Crown className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Subscription Modal */}
          {showSubscriptionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Gérer l'abonnement
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan d'abonnement
                    </label>
                    <select
                      value={editingSubscription?.planId || ''}
                      onChange={(e) => setEditingSubscription(prev => ({
                        ...prev!,
                        planId: parseInt(e.target.value)
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - {plan.price}€ ({plan.duration} jours)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée (jours)
                    </label>
                    <input
                      type="number"
                      value={editingSubscription?.duration || 30}
                      onChange={(e) => setEditingSubscription(prev => ({
                        ...prev!,
                        duration: parseInt(e.target.value)
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="1"
                    />
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => handleCancelSubscription(showSubscriptionModal)}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Annuler l\'abonnement'
                    )}
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowSubscriptionModal(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Fermer
                    </button>
                    <button
                      onClick={() => handleSaveSubscription(showSubscriptionModal)}
                      disabled={saving}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Sauvegarder'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 