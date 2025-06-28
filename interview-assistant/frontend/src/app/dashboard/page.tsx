'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHome,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMessageSquare,
  FiCalendar,
  FiMic,
  FiCreditCard,
  FiUpload,
  FiLoader,
  FiArrowRight,
  FiCheck
} from 'react-icons/fi'
import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaRobot,
  FaInstagram,
  FaFacebook
} from 'react-icons/fa'
import Link from 'next/link'
import Sidebar from '../components/Sidebar'
import { getAuthToken } from '@/utils/auth'
import { useRouter } from 'next/navigation'
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata'

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

interface CVAnalysis {
  skills: string[];
  experience: string[];
  education: string[];
  summary: string;
}

interface Discussion {
  id: string;
  title: string;
  date: string;
  type: string;
  progress: number;
  icon?: React.ReactNode;
}

interface Subscription {
  id: number;
  userId: number;
  planId: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  Plan: {
    features: {
      interviews: number | string;
      storage: string;
      support: string;
      team?: boolean;
    };
    name: string;
    price: string;
  };
}

export default function DashboardPage() {
  const [showVideo, setShowVideo] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvAnalysis, setCvAnalysis] = useState<CVAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [scanningProgress, setScanningProgress] = useState(0);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true)
  const [discussionsError, setDiscussionsError] = useState<string | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true)
  const router = useRouter()
  const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY

  // Use the page metadata hook
  usePageMetadata(PAGE_METADATA.DASHBOARD)

  useEffect(() => {
    fetchUserData()
    fetchDiscussions()
    fetchSubscriptions()
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
      } else {
        const errorText = await response.text()
        let errorMessage = `Failed to fetch user data: ${response.status}`
        
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }
        
        console.error('Error fetching user data:', errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error fetching user data'
      console.error('Error fetching user data:', errorMessage)
    } finally {
      // Only update state if component is still mounted
      setLoading(false)
    }
  }

  const fetchDiscussions = async () => {
    try {
      setLoadingDiscussions(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discussions`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        let errorMessage = `API request failed with status ${response.status}`
        
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error?.message || errorData.message || errorMessage
        } catch (e) {
          // If parsing fails, use the raw text
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Transform the data to match our Discussion interface
      const formattedDiscussions = data.map((discussion: any) => ({
        id: discussion.id,
        title: discussion.title,
        date: new Date(discussion.createdAt).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        type: discussion.type || 'Entretien général',
        progress: discussion.progress || 0,
        icon: getDiscussionIcon(discussion.type)
      }))

      setDiscussions(formattedDiscussions)
    } catch (error) {
      console.error('Error fetching discussions:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des discussions. Veuillez vérifier que le serveur est en cours d\'exécution.'
      setDiscussionsError(errorMessage)
    } finally {
      setLoadingDiscussions(false)
    }
  }

  const getDiscussionIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'technique':
        return <FiMic />
      case 'rh':
        return <FiUser />
      case 'comportemental':
        return <FiMessageSquare />
      default:
        return <FiMessageSquare />
    }
  }

  const handleCreateDiscussion = async () => {
    try {
      if (!newTitle.trim()) {
        setError('Veuillez entrer un titre pour la discussion');
        return;
      }

      // Debug CV Analysis data
      console.log('Debug CV Analysis before sending:', {
        cvAnalysis,
        cvAnalysisType: cvAnalysis ? typeof cvAnalysis : 'null',
        cvAnalysisKeys: cvAnalysis ? Object.keys(cvAnalysis) : []
      });

      // Add detailed logging for CV analysis being sent
      if (cvAnalysis) {
        console.log('🚀 ===== SENDING CV ANALYSIS TO SERVER =====');
        console.log('📋 Skills being sent:', cvAnalysis.skills);
        console.log('💼 Experience being sent:', cvAnalysis.experience);
        console.log('🎓 Education being sent:', cvAnalysis.education);
        console.log('📝 Summary being sent:', cvAnalysis.summary);
        console.log('🚀 ===== END SENDING CV ANALYSIS =====');
      } else {
        console.log('⚠️ No CV analysis data to send');
      }

      // Check if user has an active subscription
      const activeSubscription = subscriptions.find(sub => 
        sub.status === 'active' && new Date(sub.endDate) > new Date()
      );

      if (!activeSubscription) {
        setError('Vous devez avoir un abonnement actif pour créer une discussion');
        setShowModal(false);
        setShowAlert(true);
        setTimeout(() => {
          router.push('/payment');
        }, 2000);
        return;
      }

      // Check if user has reached their plan's interview limit
      const planLimit = typeof activeSubscription.Plan.features.interviews === 'number' 
        ? activeSubscription.Plan.features.interviews 
        : Infinity;

      if (planLimit !== Infinity && discussions.length >= planLimit) {
        setError(`Vous avez atteint la limite de ${planLimit} interviews de votre plan actuel. Veuillez mettre à niveau votre abonnement pour créer plus d'interviews.`);
        setShowModal(false);
        setShowAlert(true);
        setTimeout(() => {
          router.push('/payment');
        }, 2000);
        return;
      }

      setCreating(true);
      const requestBody = {
        title: newTitle,
        cvAnalysis: cvAnalysis
      };
      
      console.log('Sending request with body:', requestBody);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Response from server:', data);

      if (response.ok) {
        setDiscussions([{ id: data.id, title: data.title, date: data.createdAt, type: 'Entretien général', progress: 0 }, ...discussions]);
        setShowModal(false);
        setNewTitle('');
        setCvFile(null);
        router.push(`/chat?id=${data.id}`);
      } else {
        const errorMessage = data.message || data.error || 'Erreur lors de la création de la discussion'
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de la discussion'
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const analyzeCV = async (file: File) => {
    try {
      if (!DEEPSEEK_API_KEY) {
        throw new Error('API key not configured. Please contact support.');
      }
      
      setAnalyzing(true);
      setScanningProgress(0);
      
      console.log('🔍 Starting CV Analysis:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a PDF or Word document.');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 5MB.');
      }
      
      // Read the file content using FileReader
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (!content) {
            reject(new Error('Failed to read file content'));
            return;
          }
          resolve(content);
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
      });

      console.log('📄 File content read successfully');

      // Process and truncate the content
      const MAX_CONTENT_LENGTH = 50000; // Safe limit for API context
      let processedContent = fileContent
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/[^\w\s.,;:!?-]/g, '') // Remove special characters
        .trim();

      if (processedContent.length > MAX_CONTENT_LENGTH) {
        processedContent = processedContent.substring(0, MAX_CONTENT_LENGTH) + '...';
        console.warn('File content was truncated due to size limitations');
      }
      
      // Simulate scanning progress
      const progressInterval = setInterval(() => {
        setScanningProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      console.log('🤖 Sending request to DeepSeek API');
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are a CV analyzer. Extract key information from the CV including skills, experience, education, and a brief summary. Always respond in valid JSON format."
            },
            {
              role: "user",
              content: `Analyze this CV content and provide the information in this exact JSON format:
              {
                "skills": ["skill1", "skill2"],
                "experience": ["exp1", "exp2"],
                "education": ["edu1", "edu2"],
                "summary": "brief summary"
              }
              
              CV Content:
              ${processedContent}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      clearInterval(progressInterval);
      setScanningProgress(100);

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', errorText)
        let errorMessage = `API request failed with status ${response.status}`
        
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error?.message || errorData.message || errorMessage
        } catch (e) {
          // If parsing fails, use the raw text
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json();
      console.log('📥 Received API response:', data);

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }

      const content = data.choices[0].message.content;
      console.log('📋 Raw API content:', content);
      
      // Try to extract JSON from the response
      let analysis;
      try {
        // First try direct JSON parse
        analysis = JSON.parse(content);
        console.log('✅ Successfully parsed JSON directly');
      } catch (e) {
        console.log('⚠️ Direct JSON parse failed, trying to extract JSON from text');
        // If that fails, try to extract JSON from the text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
          console.log('✅ Successfully extracted and parsed JSON from text');
        } else {
          throw new Error('Could not parse CV analysis response');
        }
      }

      console.log('📊 Final CV Analysis:', {
        skills: analysis.skills,
        experience: analysis.experience,
        education: analysis.education,
        summary: analysis.summary
      });

      // Add detailed console logging for CV analysis
      console.log('🔍 ===== CV ANALYSIS RESULTS =====');
      console.log('📋 Skills found:', analysis.skills);
      console.log('💼 Experience:', analysis.experience);
      console.log('🎓 Education:', analysis.education);
      console.log('📝 Summary:', analysis.summary);
      console.log('🔍 ===== END CV ANALYSIS =====');

      setCvAnalysis(analysis);
      return analysis;
    } catch (error) {
      console.error('❌ CV Analysis Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred while analyzing the CV');
      return null;
    } finally {
      setAnalyzing(false);
      setScanningProgress(0);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      await analyzeCV(file);
    }
  };

  const handleDeleteDiscussion = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette discussion ?')) {
      return
    }

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('Non authentifié')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discussions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Try to get the response text first
      const responseText = await response.text()

      let errorMessage = 'Erreur lors de la suppression de la discussion'
      
      if (!response.ok) {
        try {
          // Try to parse the response as JSON
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          // If parsing fails, use the raw text or a default message
          errorMessage = responseText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // If we get here, the deletion was successful
      setDiscussions(prevDiscussions => prevDiscussions.filter(d => d.id !== id))
      alert('Discussion supprimée avec succès')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression de la discussion'
      alert(errorMessage)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true)
      const token = getAuthToken()
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      })
      
      const responseText = await response.text()
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch subscriptions: ${response.status} ${response.statusText}`
        
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          // If parsing fails, use the raw text
          errorMessage = responseText || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse response as JSON:', e)
        throw new Error('Invalid JSON response from server')
      }

      setSubscriptions(data)
    } catch (error: unknown) {
      console.error('Detailed error in fetchSubscriptions:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des abonnements'
      setError(errorMessage)
    } finally {
      setLoadingSubscriptions(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto md:ml-80 mt-2.5 sm:mt-0">
        <motion.header
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="text-white">
                Bienvenue, {loading ? '...' : userData?.firstName || 'Utilisateur'}
              </span>
              <motion.span
                className="text-emerald-400"
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -15, 15, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
              >
                <FaRobot size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              </motion.span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2">
              {userData?.email ? `Connecté en tant que ${userData.email}` : 'Chargement...'}
            </p>
          </div>

          <button
            onClick={() => {
              // Check if user has an active subscription
              const hasActiveSubscription = subscriptions.some(sub => 
                sub.status === 'active' && new Date(sub.endDate) > new Date()
              );

              if (!hasActiveSubscription) {
                setShowAlert(true);
                setTimeout(() => {
                  router.push('/payment');
                }, 2000);
                return;
              }
              setShowModal(true);
            }}
            className="relative group w-full sm:w-auto px-4 sm:px-7 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105"
          >
            <span className="absolute -inset-px rounded-full bg-gradient-to-r from-emerald-500/30 to-teal-500/30 opacity-0 group-hover:opacity-100 blur-md transition"></span>
            <span className="relative z-10">+ Nouvelle discussion</span>
          </button>
        </motion.header>

        {/* How it works */}
        <motion.section
          className="mb-12 sm:mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Comment ça marche ?
                  </span>
                </h2>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                  Interv-ia est votre assistant intelligent pour la préparation d'entretiens. Simulez des conversations, recevez un feedback détaillé et améliorez vos performances en continu.
                </p>
                {!showVideo && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-full shadow-lg hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                  >
                    🎬 Démarrer la démonstration
                  </button>
                )}
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg aspect-video border border-white/10 bg-white/5">
                {!showVideo ? (
                  <img
                    src="https://t3.ftcdn.net/jpg/09/30/65/02/360_F_930650217_Vwt3AsTOOPA7ei4YLIIsiMyG4cEsEiP5.jpg"
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Vidéo explicative"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Recent discussions */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12 sm:mb-16"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                🧠 Dernières discussions
              </span>
            </h2>
            <Link 
              href="/all" 
              className="text-sm text-gray-300 hover:text-emerald-400 transition-colors flex items-center gap-1 self-start sm:self-auto"
            >
              Voir tout
              <FiArrowRight className="text-xs" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {loadingDiscussions ? (
              // Loading state
              Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
                >
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-white/10" />
                      <div className="w-24 h-6 bg-white/10 rounded-full" />
                    </div>
                    <div className="h-6 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                    <div className="h-2 bg-white/10 rounded-full" />
                  </div>
                </motion.div>
              ))
            ) : discussionsError ? (
              // Error state
              <div className="col-span-3 text-center py-8">
                <p className="text-red-400 mb-4">{discussionsError}</p>
                <button
                  onClick={fetchDiscussions}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Réessayer
                </button>
              </div>
            ) : discussions.length === 0 ? (
              // Empty state
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-300 mb-4">Aucune discussion trouvée</p>
              </div>
            ) : (
              // Discussions list
              discussions.map((discussion, index) => (
                <motion.div
                  key={discussion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                        {discussion.icon}
                      </div>
                      <span className="text-xs text-gray-300 bg-white/10 px-3 py-1 rounded-full">
                        {discussion.date}
                      </span>
                    </div>

                    <h3 className="text-white font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
                      {discussion.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-gray-300 bg-white/10 px-2 py-0.5 rounded-full">
                        {discussion.type}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Link 
                        href={`/chat?id=${discussion.id}`}
                        className="text-xs text-gray-300 hover:text-emerald-400 transition-colors flex items-center gap-1"
                      >
                        Continuer
                        <FiArrowRight className="text-xs" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        {/* Subscriptions Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12 sm:mb-16"
        >
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                💳 Abonnements
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {loadingSubscriptions ? (
              // Loading state
              Array.from({ length: 2 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-lg"
                >
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-32 h-6 bg-white/10 rounded" />
                      <div className="w-24 h-6 bg-white/10 rounded-full" />
                    </div>
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                  </div>
                </motion.div>
              ))
            ) : subscriptions.length === 0 ? (
              // No subscription alert with payment section
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-lg"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Aucun abonnement actif</h3>
                    <p className="text-gray-300 mb-4 text-sm sm:text-base">
                      Pour accéder à toutes les fonctionnalités, veuillez souscrire à un de nos plans premium.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <FiCheck className="text-emerald-400 text-sm" />
                        </div>
                        <span className="text-gray-300 text-sm sm:text-base">Interviews personnalisés illimités</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <FiCheck className="text-emerald-400 text-sm" />
                        </div>
                        <span className="text-gray-300 text-sm sm:text-base">Analyse de CV avancée</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <FiCheck className="text-emerald-400 text-sm" />
                        </div>
                        <span className="text-gray-300 text-sm sm:text-base">Stockage illimité de documents</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/payment"
                    className="px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-full shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-105 text-sm sm:text-base w-full sm:w-auto text-center"
                  >
                    Voir les plans
                  </Link>
                </div>
              </motion.div>
            ) : (
              // Subscriptions list
              subscriptions.map((subscription, index) => {
                // Skip subscriptions without a Plan
                if (!subscription.Plan) {
                  console.warn('Subscription missing Plan:', subscription.id);
                  return null;
                }

                return (
                  <motion.div
                    key={subscription.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="text-lg sm:text-xl font-semibold text-white">
                            {subscription.Plan.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                            subscription.status === 'active' 
                              ? 'bg-green-500/20 text-green-400'
                              : subscription.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {subscription.status === 'active' ? 'Actif' : 
                             subscription.status === 'cancelled' ? 'Annulé' : 'En attente'}
                          </span>
                        </div>
                        <p className="text-gray-300 text-xs sm:text-sm">
                          {new Date(subscription.startDate).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })} - {new Date(subscription.endDate).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                          {typeof subscription.Plan.features.interviews === 'number'
                            ? `${subscription.Plan.features.interviews} interviews`
                            : 'Interviews illimités'}
                        </span>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                          Stockage {subscription.Plan.features.storage}
                        </span>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                          Support {subscription.Plan.features.support}
                        </span>
                        {subscription.Plan.features.team && (
                          <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                            Gestion d'équipe
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              }).filter(Boolean) // Remove null entries
            )}
          </div>
        </motion.section>

        {/* Payment Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-12 sm:mb-16"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl transition hover:shadow-[#14CF93]/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white bg-gradient-to-r from-[#14CF93] to-[#0FB88F] bg-clip-text text-transparent">
                  Améliorez votre expérience
                </h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-6">
                  Découvrez nos plans premium pour accéder à plus d'interviews, un stockage étendu et un support prioritaire.
                </p>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#14CF93]/20 flex items-center justify-center">
                      <FiCheck className="text-[#14CF93] text-sm" />
                    </div>
                    <span className="text-white/90 text-sm sm:text-base">Interviews personnalisés illimités</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#14CF93]/20 flex items-center justify-center">
                      <FiCheck className="text-[#14CF93] text-sm" />
                    </div>
                    <span className="text-white/90 text-sm sm:text-base">Analyse de CV avancée</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#14CF93]/20 flex items-center justify-center">
                      <FiCheck className="text-[#14CF93] text-sm" />
                    </div>
                    <span className="text-white/90 text-sm sm:text-base">Stockage illimité de documents</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#14CF93]/20 flex items-center justify-center">
                      <FiCheck className="text-[#14CF93] text-sm" />
                    </div>
                    <span className="text-white/90 text-sm sm:text-base">Support prioritaire 24/7</span>
                  </div>
                </div>
                <Link 
                  href="/payment"
                  className="inline-block px-4 sm:px-6 py-3 bg-gradient-to-r from-[#14CF93] to-[#0FB88F] text-white font-semibold rounded-full shadow hover:scale-105 transition text-sm sm:text-base"
                >
                  Voir les plans
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#14CF93]/20 flex items-center justify-center mb-3 sm:mb-4">
                    <FiMessageSquare className="text-[#14CF93] text-lg sm:text-xl" />
                  </div>
                  <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Interviews illimités</h3>
                  <p className="text-white/70 text-xs sm:text-sm">Accédez à un nombre illimité d'interviews personnalisés</p>
                </div>
                <div className="bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#14CF93]/20 flex items-center justify-center mb-3 sm:mb-4">
                    <FiUpload className="text-[#14CF93] text-lg sm:text-xl" />
                  </div>
                  <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Stockage étendu</h3>
                  <p className="text-white/70 text-xs sm:text-sm">Conservez tous vos CV et documents importants</p>
                </div>
                <div className="bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#14CF93]/20 flex items-center justify-center mb-3 sm:mb-4">
                    <FiUser className="text-[#14CF93] text-lg sm:text-xl" />
                  </div>
                  <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Support prioritaire</h3>
                  <p className="text-white/70 text-xs sm:text-sm">Bénéficiez d'une assistance rapide et personnalisée</p>
                </div>
                <div className="bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#14CF93]/20 flex items-center justify-center mb-3 sm:mb-4">
                    <FiSettings className="text-[#14CF93] text-lg sm:text-xl" />
                  </div>
                  <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Fonctionnalités avancées</h3>
                  <p className="text-white/70 text-xs sm:text-sm">Accédez à des outils exclusifs pour votre préparation</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

      </main>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="bg-white text-[#0B243A] rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              <h2 className="text-lg sm:text-xl font-bold mb-4">Nouvelle discussion</h2>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Titre de la discussion"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0FB88F] mb-6 placeholder-gray-400"
              />
              
              {/* CV Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CV (Optionnel)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#0FB88F] transition-colors">
                      <FiUpload className="text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-500">
                        {analyzing ? 'Analyse en cours...' : cvFile ? cvFile.name : 'Cliquez pour télécharger votre CV'}
                      </span>
                    </div>
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Formats acceptés: PDF, DOC, DOCX
                </p>
                
                {analyzing && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <FiLoader className="animate-spin text-[#0FB88F]" />
                      <span className="text-sm font-medium text-gray-700">Analyse du CV en cours...</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-[#0FB88F] h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${scanningProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {scanningProgress < 30 ? "Lecture du document..." :
                       scanningProgress < 60 ? "Extraction des informations..." :
                       scanningProgress < 90 ? "Analyse par l'IA..." :
                       "Finalisation..."}
                    </p>
                  </div>
                )}
                
                {cvAnalysis && !analyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Analyse du CV par l'IA</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-medium text-gray-600 mb-1">Compétences</h4>
                        <div className="flex flex-wrap gap-2">
                          {cvAnalysis.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-[#0FB88F]/10 text-[#0FB88F] text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-600 mb-1">Expérience</h4>
                        <ul className="text-xs text-gray-500 space-y-1">
                          {cvAnalysis.experience.map((exp, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-[#0FB88F]">•</span>
                              {exp}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-600 mb-1">Formation</h4>
                        <ul className="text-xs text-gray-500 space-y-1">
                          {cvAnalysis.education.map((edu, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-[#0FB88F]">•</span>
                              {edu}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-600 mb-1">Résumé</h4>
                        <p className="text-xs text-gray-500 italic">{cvAnalysis.summary}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setCvFile(null);
                  }}
                  className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-red-500"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateDiscussion}
                  disabled={creating}
                  className="px-4 py-2 bg-gradient-to-r from-[#14CF93] to-[#0FB88F] text-white text-sm font-semibold rounded-lg shadow hover:opacity-90 disabled:opacity-50"
                >
                  {creating ? 'Création...' : 'Créer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className="bg-gradient-to-r from-red-500/90 to-orange-500/90 backdrop-blur-md border border-red-400/30 rounded-2xl p-6 shadow-2xl max-w-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <FiCreditCard className="text-white text-xl" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {error?.includes('limite') ? 'Limite atteinte' : 'Abonnement requis'}
                  </h3>
                  <p className="text-white/90 text-sm mb-4">
                    {error || 'Pour créer une nouvelle discussion, vous devez avoir un abonnement actif. Redirection vers la page de paiement...'}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-white/20 rounded-full h-1.5">
                      <motion.div
                        className="bg-white h-1.5 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, ease: "linear" }}
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAlert(false)}
                  className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Components
function SidebarLink({ icon, text, href }: { icon: React.ReactNode; text: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition text-white text-sm font-medium"
    >
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
    </Link>
  )
}

function DiscussionPreview({ title, date }: { title: string; date: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-5 rounded-2xl bg-white/10 border border-white/20 shadow-md hover:shadow-xl transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#14CF93] to-[#006F74] flex items-center justify-center text-white shadow-md">
          <FiMessageSquare size={20} />
        </div>
        <div className="flex flex-col">
          <h3 className="text-white font-semibold group-hover:text-[#14CF93] transition">
            {title}
          </h3>
          <span className="text-xs text-white/60 mt-1">Simulation guidée par IA</span>
        </div>
      </div>
      <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm text-white font-medium">
        {date}
      </span>
    </motion.div>
  )
}

function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-white hover:text-[#14CF93] text-xl transition"
    >
      {icon}
    </a>
  )
}
