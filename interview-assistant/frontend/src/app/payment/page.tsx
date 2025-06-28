'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiCreditCard, FiMessageSquare, FiUpload, FiUser, FiSettings } from 'react-icons/fi'
import Sidebar from '../components/Sidebar'
import { getAuthToken } from '@/utils/auth'
import { useRouter } from 'next/navigation'
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata'

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: {
    interviews: string | number;
    storage: string;
    support: string;
    team?: boolean;
  };
}

interface Subscription {
  id: number;
  planId: number;
  startDate: string;
  endDate: string;
  status: string;
  plan: Plan;
}

export default function PaymentPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Use the page metadata hook
  usePageMetadata(PAGE_METADATA.PAYMENT)

  useEffect(() => {
    fetchPlans()
    fetchCurrentSubscription()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plans/public`)
      
      if (response.ok) {
        const data = await response.json()
        setPlans(data)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des plans' })
    }
  }

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/current`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCurrentSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (plan: Plan) => {
    try {
      setSubscribing(plan.id);
      console.log('Selected plan:', plan); // Debug log
      
      // Check if plan is free (price is 0)
      if (Number(plan.price) === 0) {
        console.log('Activating free plan'); // Debug log
        // For free plan
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({ planId: plan.id })
        })

        if (response.ok) {
          setMessage({ type: 'success', text: 'Abonnement gratuit activé avec succès ! Vous pouvez maintenant utiliser toutes les fonctionnalités de votre plan.' })
          // Refresh subscription data
          await fetchCurrentSubscription()
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        } else {
          throw new Error('Erreur lors de l\'activation de l\'abonnement')
        }
      } else {
        console.log('Redirecting to checkout for paid plan:', plan.id); // Debug log
        // Only redirect to checkout for paid plans
        const checkoutUrl = `/payment/checkout?planId=${plan.id}`;
        console.log('Checkout URL:', checkoutUrl); // Debug log
        router.push(checkoutUrl);
      }
    } catch (error) {
      console.error('Error subscribing to plan:', error)
      setMessage({ type: 'error', text: 'Erreur lors de l\'activation de l\'abonnement' })
    } finally {
      setSubscribing(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans">
        <Sidebar />
        
        <main className="flex-1 p-10 text-white">
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
          className="max-w-6xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Abonnements
              </span>
            </h1>
            <p className="text-gray-300 mb-6">
              Choisissez le plan qui correspond le mieux à vos besoins
            </p>

            {/* Active Subscription Section */}
            {currentSubscription && currentSubscription.plan && (
              <div className="mb-8 p-6 bg-emerald-500/10 backdrop-blur-xl rounded-xl border border-emerald-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-emerald-400">Abonnement Actif</h2>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                    {currentSubscription.status === 'active' ? 'Actif' : 'En attente'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-white">{currentSubscription.plan?.name || 'Plan non spécifié'}</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>Prix: {currentSubscription.plan?.price === 0 ? 'Gratuit' : `${currentSubscription.plan?.price || 0}€/mois`}</p>
                      <p>Début: {currentSubscription.startDate ? new Date(currentSubscription.startDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Non spécifié'}</p>
                      <p>Fin: {currentSubscription.endDate ? new Date(currentSubscription.endDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Non spécifié'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-white">Fonctionnalités incluses:</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center gap-2">
                        <FiCheck className="text-emerald-400" />
                        <span>
                          {currentSubscription.plan?.features?.interviews 
                            ? (typeof currentSubscription.plan.features.interviews === 'number'
                              ? `${currentSubscription.plan.features.interviews} interviews`
                              : 'Interviews illimités')
                            : 'Interviews non spécifiés'}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheck className="text-emerald-400" />
                        <span>Stockage {currentSubscription.plan?.features?.storage || 'non spécifié'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheck className="text-emerald-400" />
                        <span>Support {currentSubscription.plan?.features?.support || 'non spécifié'}</span>
                      </li>
                      {currentSubscription.plan?.features?.team && (
                        <li className="flex items-center gap-2">
                          <FiCheck className="text-emerald-400" />
                          <span>Gestion d'équipe</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Feature List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <FiMessageSquare className="text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white">Interviews Illimités</h3>
                </div>
                <p className="text-sm text-gray-300">Accédez à un nombre illimité d'interviews personnalisés avec notre IA</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <FiUpload className="text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white">Stockage Étendu</h3>
                </div>
                <p className="text-sm text-gray-300">Conservez tous vos CV et documents importants en toute sécurité</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <FiUser className="text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white">Support Prioritaire</h3>
                </div>
                <p className="text-sm text-gray-300">Bénéficiez d'une assistance rapide et personnalisée 24/7</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <FiSettings className="text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white">Fonctionnalités Avancées</h3>
                </div>
                <p className="text-sm text-gray-300">Accédez à des outils exclusifs pour optimiser votre préparation</p>
              </div>
            </div>

            {/* Feature Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg mb-2 text-white">Fonctionnalités Incluses</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-emerald-400" />
                    <span className="text-sm text-gray-300">Interviews personnalisés selon votre profil</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-emerald-400" />
                    <span className="text-sm text-gray-300">Analyse détaillée de vos performances</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-emerald-400" />
                    <span className="text-sm text-gray-300">Feedback en temps réel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-emerald-400" />
                    <span className="text-sm text-gray-300">Historique complet des entretiens</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg mb-2 text-white">Avantages Premium</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-emerald-400" />
                    <span className="text-sm text-gray-300">Accès prioritaire aux nouvelles fonctionnalités</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-emerald-400" />
                    <span className="text-sm text-gray-300">Support dédié par email et chat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-emerald-400" />
                    <span className="text-sm text-gray-300">Rapports d'analyse avancés</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-emerald-400" />
                    <span className="text-sm text-gray-300">Mises à jour régulières des scénarios</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl mb-6 ${
                message.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: plan.id * 0.1 }}
                className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 ${
                  currentSubscription?.planId === plan.id ? 'ring-2 ring-[#14CF93]' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="text-white/70 text-sm">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                    </div>
                    <div className="text-sm text-white/70">/mois</div>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <FiCheck className="text-emerald-400 mr-2" />
                    <span>{plan.features && typeof plan.features.interviews === 'number' 
                      ? `${plan.features.interviews} interviews` 
                      : 'Interviews illimités'}</span>
                  </li>
                  <li className="flex items-center">
                    <FiCheck className="text-emerald-400 mr-2" />
                    <span>Stockage {plan.features?.storage || 'Standard'}</span>
                  </li>
                  <li className="flex items-center">
                    <FiCheck className="text-emerald-400 mr-2" />
                    <span>Support {plan.features?.support || 'Email'}</span>
                  </li>
                  {plan.features?.team && (
                    <li className="flex items-center">
                      <FiCheck className="text-emerald-400 mr-2" />
                      <span>Gestion d'équipe</span>
                    </li>
                  )}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={currentSubscription?.planId === plan.id || subscribing === plan.id}
                  className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    currentSubscription?.planId === plan.id
                      ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                      : subscribing === plan.id
                      ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                      : plan.price === 0
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:scale-105 shadow-lg hover:shadow-green-500/25'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white hover:scale-105 shadow-lg hover:shadow-emerald-500/25'
                  }`}
                >
                  {currentSubscription?.planId === plan.id
                    ? 'Plan actuel'
                    : subscribing === plan.id
                    ? 'Chargement...'
                    : plan.price === 0
                    ? 'Commencer gratuitement'
                    : 'S\'abonner'}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
