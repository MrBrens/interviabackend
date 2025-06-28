'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { getUserData } from '@/utils/auth';
import { 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  MessageSquare, 
  User, 
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata';

interface Discussion {
  id: number;
  title: string;
  status: string;
  lastMessageAt: string;
  createdAt: string;
  messageCount: number;
  lastMessage?: {
    id: number;
    role: string;
    type: string;
    content: string;
    createdAt: string;
  };
  User: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface DiscussionsResponse {
  discussions: Discussion[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export default function AdminInterviewsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [allDiscussions, setAllDiscussions] = useState<Discussion[]>([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState<Discussion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDiscussions, setTotalDiscussions] = useState(0);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [hasLoadedAll, setHasLoadedAll] = useState(false);

  // Use the page metadata hook
  usePageMetadata(PAGE_METADATA.ADMIN_INTERVIEWS);

  useEffect(() => {
    // Check if user is logged in and has admin role
    const user = getUserData();
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchAllDiscussions();
  }, [router]);

  // Filter discussions when search term or status filter changes
  useEffect(() => {
    filterDiscussions();
  }, [searchTerm, statusFilter, allDiscussions]);

  // Update pagination when filtered discussions change
  useEffect(() => {
    const itemsPerPage = 20;
    const totalFiltered = filteredDiscussions.length;
    const newTotalPages = Math.ceil(totalFiltered / itemsPerPage);
    setTotalPages(newTotalPages);
    setTotalDiscussions(totalFiltered);
    
    // Reset to first page if current page is out of bounds
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredDiscussions, currentPage]);

  const fetchAllDiscussions = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Aucun token d\'authentification trouvé');
      }

        // Fetch all discussions without pagination
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/discussions?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Échec de la récupération des discussions');
      }

      const data: DiscussionsResponse = await response.json();
      setAllDiscussions(data.discussions);
      setHasLoadedAll(true);
      setError(null);
    } catch (err) {
      console.error('Error fetching discussions:', err);
      setError(err instanceof Error ? err.message : 'Échec du chargement des discussions');
    } finally {
      setIsLoading(false);
    }
  };

  const filterDiscussions = () => {
    let filtered = [...allDiscussions];

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(discussion => 
        discussion.title.toLowerCase().includes(searchLower) ||
        discussion.User.firstName.toLowerCase().includes(searchLower) ||
        discussion.User.lastName.toLowerCase().includes(searchLower) ||
        discussion.User.email.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(discussion => discussion.status === statusFilter);
    }

    setFilteredDiscussions(filtered);
  };

  const handleDeleteDiscussion = async (discussionId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette discussion ? Cette action ne peut pas être annulée.')) {
      return;
    }

    try {
      setIsDeleting(discussionId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/discussions/${discussionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Échec de la suppression de la discussion');
      }

      // Remove the deleted discussion from both arrays
      setAllDiscussions(prev => prev.filter(d => d.id !== discussionId));
      setFilteredDiscussions(prev => prev.filter(d => d.id !== discussionId));
    } catch (err) {
      console.error('Error deleting discussion:', err);
      alert('Échec de la suppression de la discussion');
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Get current page discussions
  const getCurrentPageDiscussions = () => {
    const itemsPerPage = 20;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDiscussions.slice(startIndex, endIndex);
  };

  if (isLoading && !hasLoadedAll) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
          <p className="text-gray-600">Chargement des discussions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="pl-72">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
              <button 
                onClick={fetchAllDiscussions}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPageDiscussions = getCurrentPageDiscussions();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-72">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Entretiens et Discussions</h1>
            <p className="mt-2 text-gray-600">
              Gérez tous les entretiens et discussions des utilisateurs ({totalDiscussions} au total)
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Rechercher par titre, nom d'utilisateur ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Tous les Statuts</option>
                  <option value="active">Actif</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Discussions List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                   
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Messages
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière Activité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Créé
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPageDiscussions.map((discussion) => (
                    <tr key={discussion.id} className="hover:bg-gray-50">
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {discussion.User.firstName} {discussion.User.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {discussion.User.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {discussion.messageCount} messages
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          discussion.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {discussion.status === 'active' ? 'Actif' : discussion.status === 'archived' ? 'Archivé' : discussion.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(discussion.lastMessageAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(discussion.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/admin/interviews/${discussion.id}`)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDiscussion(discussion.id)}
                            disabled={isDeleting === discussion.id}
                            className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                            title="Supprimer la discussion"
                          >
                            {isDeleting === discussion.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredDiscussions.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune discussion trouvée</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter ? 'Essayez d\'ajuster votre recherche ou vos filtres.' : 'Aucune discussion n\'a encore été créée.'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow-sm">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de la page <span className="font-medium">{currentPage}</span> sur{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 