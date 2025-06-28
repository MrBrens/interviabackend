'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { getUserData } from '@/utils/auth';
import { 
  ArrowLeft, 
  User, 
  MessageSquare, 
  Calendar,
  Clock,
  Loader2,
  Trash2,
  Copy,
  Download
} from 'lucide-react';

interface Message {
  id: number;
  role: string;
  type: string;
  content: string;
  audioUrl?: string;
  label?: string;
  createdAt: string;
}

interface Discussion {
  id: number;
  title: string;
  status: string;
  lastMessageAt: string;
  createdAt: string;
  User: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  Messages: Message[];
}

export default function DiscussionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const discussionId = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

    if (discussionId) {
      fetchDiscussion();
    }
  }, [router, discussionId]);

  const fetchDiscussion = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Aucun token d\'authentification trouvé');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/discussions/${discussionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Échec de la récupération de la discussion');
      }

      const data: Discussion = await response.json();
      setDiscussion(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching discussion:', err);
      setError(err instanceof Error ? err.message : 'Échec du chargement de la discussion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDiscussion = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette discussion ? Cette action ne peut pas être annulée.')) {
      return;
    }

    try {
      setIsDeleting(true);
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

      router.push('/admin/interviews');
    } catch (err) {
      console.error('Error deleting discussion:', err);
      alert('Échec de la suppression de la discussion');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
          <p className="text-gray-600">Chargement de la discussion...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="pl-72">
          <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
              <button 
                onClick={fetchDiscussion}
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

  if (!discussion) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="pl-72">
          <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">Discussion introuvable</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-72">
        <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/admin/interviews')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux Entretiens
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{discussion.title}</h1>
                <p className="mt-2 text-gray-600">
                  ID Discussion : {discussion.id} • {discussion.Messages.length} messages
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  discussion.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {discussion.status === 'active' ? 'Actif' : discussion.status === 'archived' ? 'Archivé' : discussion.status}
                </span>
                
                <button
                  onClick={handleDeleteDiscussion}
                  disabled={isDeleting}
                  className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Supprimer
                </button>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Informations Utilisateur
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nom</p>
                <p className="text-sm text-gray-900">
                  {discussion.User.firstName} {discussion.User.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{discussion.User.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Créé</p>
                <p className="text-sm text-gray-900">{formatDate(discussion.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Dernière Activité</p>
                <p className="text-sm text-gray-900">{formatDate(discussion.lastMessageAt)}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                Messages ({discussion.Messages.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {discussion.Messages.map((message, index) => (
                <div key={message.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        message.role === 'user' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <MessageSquare className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {message.role === 'user' ? 'Utilisateur' : 'Assistant'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {message.label && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {message.label}
                        </span>
                      )}
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Copier le message"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="ml-11">
                    {message.type === 'vocal' && message.audioUrl ? (
                      <div className="flex items-center space-x-3">
                        <audio controls className="w-full max-w-md">
                          <source src={message.audioUrl} type="audio/webm" />
                          Votre navigateur ne prend pas en charge l'élément audio.
                        </audio>
                        <button
                          onClick={() => window.open(message.audioUrl, '_blank')}
                          className="text-gray-400 hover:text-gray-600 p-1"
                          title="Télécharger l'audio"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {discussion.Messages.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun message</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Cette discussion n'a pas encore de messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 