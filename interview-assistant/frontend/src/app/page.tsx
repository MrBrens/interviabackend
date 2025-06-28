'use client'
import { FiMic, FiTrendingUp, FiBarChart2, FiCheck, FiLoader, FiMenu, FiX, FiArrowRight, FiStar, FiUsers, FiShield, FiZap } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaLinkedin, FaGithub, FaTwitter, FaPlay } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import ChatBotBubble from './components/ChatBotBubble'
import { planService, Plan } from '@/services/planService'
import { getAuthToken } from '@/utils/auth'
import { useRouter } from 'next/navigation'
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata'

export default function LandingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Use the page metadata hook
  usePageMetadata(PAGE_METADATA.HOME)

  useEffect(() => {
    fetchPlans()
    // Check if user is authenticated
    const token = getAuthToken()
    setIsAuthenticated(!!token)
  }, [])

  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlans = async () => {
    try {
      const data = await planService.getPublicPlans()
      setPlans(data)
    } catch (err) {
      setError('Erreur lors du chargement des plans')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number | string, duration: number) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (billing === 'yearly') {
      const yearlyPrice = numericPrice * 12 * 0.8 // 20% discount for yearly
      return `${yearlyPrice.toFixed(2)}€/an`
    }
    return `${numericPrice.toFixed(2)}€/mois`
  }

  const handleAuthClick = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <main className="font-sans bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-x-hidden">
      {/* Enhanced Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-0">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center">
            <div className="flex items-center justify-center ">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-1 shadow-2xl">
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                  <img
                    src="/logo2.jpeg"
                    alt="Logo"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
          </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {['home', 'features', 'pricing', 'about'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="text-white/80 hover:text-white font-medium transition-all duration-300 hover:scale-105 capitalize"
                >
                  {item === 'home' ? 'Accueil' : 
                   item === 'features' ? 'Fonctionnalités' :
                   item === 'pricing' ? 'Tarifs' : 'À propos'}
                </button>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleAuthClick}
                className="hidden sm:inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-full hover:from-emerald-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isAuthenticated ? 'Tableau de bord' : 'Commencer'}
                <FiArrowRight className="ml-2 h-4 w-4" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <FiX className="h-6 w-6 text-white" />
                ) : (
                  <FiMenu className="h-6 w-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/10 backdrop-blur-xl border-t border-white/20"
            >
              <div className="px-4 py-6 space-y-4">
                {['home', 'features', 'pricing', 'about'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className="block w-full text-left text-white/80 hover:text-white font-medium py-2 transition-colors capitalize"
                  >
                    {item === 'home' ? 'Accueil' : 
                     item === 'features' ? 'Fonctionnalités' :
                     item === 'pricing' ? 'Tarifs' : 'À propos'}
                  </button>
                ))}
                <button 
                  onClick={handleAuthClick}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all duration-300"
                >
                  {isAuthenticated ? 'Tableau de bord' : 'Commencer'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Enhanced Hero Section */}
      <section
        id="home"
        className="min-h-screen relative flex items-center justify-center pt-20 overflow-hidden"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-20 blur-xl"
          />
          <motion.div
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 blur-xl"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Avatar and Chat Bubbles */}
            <div className="flex flex-col items-center space-y-6 mt-10  ">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full p-1 shadow-2xl">
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                    <FiMic className="w-8 h-8 md:w-12 md:h-12 text-emerald-400" />
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-center space-y-4"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-emerald-400">
                  👋 Bienvenue sur Interv-ia
                </h3>
                <p className="text-lg text-gray-300 max-w-2xl">
                  Votre assistant IA personnel pour réussir vos entretiens d'embauche
                </p>
              </motion.div>
            </div>

            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 bg-clip-text text-transparent mt-10">
                  Maîtrisez vos
                </span>
                <br />
                <span className="text-white">entretiens avec l'IA</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Préparez-vous aux entretiens d'embauche avec notre IA avancée. 
                Simulation réaliste, feedback personnalisé, résultats garantis.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/dashboard">
                <button className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-lg font-bold rounded-full shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                  <span>🎤 Lancer l'entretien</span>
                  <FaPlay className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button className="px-8 py-4 border-2 border-white/20 text-white rounded-full hover:bg-white/10 transition-all duration-300 flex items-center space-x-2">
                <span>Voir la démo</span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-12 mb-16"
            >
              {[
                { number: "10K+", label: "Utilisateurs" },
                { number: "95%", label: "Taux de réussite" },
                { number: "24/7", label: "Disponible" },
                { number: "50+", label: "Types d'entretiens" }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-emerald-400">{stat.number}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Fonctionnalités
              </span>
              <br />
              <span className="text-white">révolutionnaires</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Découvrez comment notre IA transforme votre préparation aux entretiens
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FiMic className="w-8 h-8" />,
                title: "Simulation d'entretien",
                desc: "Passez des entretiens interactifs avec une IA qui s'adapte à votre niveau et votre secteur.",
                gradient: "from-emerald-500 to-teal-500"
              },
              {
                icon: <FiBarChart2 className="w-8 h-8" />,
                title: "Analyse intelligente",
                desc: "Obtenez un feedback détaillé sur vos réponses avec des suggestions d'amélioration.",
                gradient: "from-blue-500 to-purple-500"
              },
              {
                icon: <FiTrendingUp className="w-8 h-8" />,
                title: "Suivi des progrès",
                desc: "Visualisez vos améliorations au fil du temps avec des graphiques détaillés.",
                gradient: "from-orange-500 to-red-500"
              },
              {
                icon: <FiUsers className="w-8 h-8" />,
                title: "Communauté",
                desc: "Rejoignez une communauté d'utilisateurs et partagez vos expériences.",
                gradient: "from-pink-500 to-rose-500"
              },
              {
                icon: <FiShield className="w-8 h-8" />,
                title: "Confidentialité",
                desc: "Vos données sont protégées et vos entretiens restent privés.",
                gradient: "from-indigo-500 to-blue-500"
              },
              {
                icon: <FiZap className="w-8 h-8" />,
                title: "Performance",
                desc: "Interface ultra-rapide et réactive pour une expérience fluide.",
                gradient: "from-yellow-500 to-orange-500"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 group-hover:scale-105">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Tarifs
              </span>
              <br />
              <span className="text-white">transparents</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Choisissez le plan qui correspond à vos besoins
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex bg-white/10 backdrop-blur-xl rounded-full p-1 border border-white/20">
              <button 
                onClick={() => setBilling('monthly')} 
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  billing === 'monthly' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Mensuel
              </button>
              <button 
                onClick={() => setBilling('yearly')} 
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  billing === 'yearly' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Annuel <span className="text-xs ml-1 bg-emerald-500 text-white px-2 py-1 rounded-full">-20%</span>
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-3 flex justify-center items-center py-20"
                >
                  <div className="flex items-center space-x-2">
                    <FiLoader className="w-6 h-6 animate-spin text-emerald-400" />
                    <span className="text-gray-300">Chargement des plans...</span>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-3 text-center py-20"
                >
                  <div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-4">
                    {error}
                  </div>
                </motion.div>
              ) : (
                plans.map((plan, i) => {
                  const isPopular = plan.name.toLowerCase().includes('premium')
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className={`relative group ${isPopular ? 'md:scale-105' : ''}`}
                    >
                      {isPopular && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-1"
                        >
                          <FiStar className="w-4 h-4" />
                          <span>Populaire</span>
                        </motion.div>
                      )}
                      
                      <div className={`relative h-full ${
                        isPopular
                          ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/50'
                          : 'bg-white/5 border-white/10'
                      } backdrop-blur-xl border rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 group-hover:scale-105`}>
                        
                        <div className="text-center mb-8">
                          <h3 className="text-2xl font-bold mb-4 text-white">{plan.name}</h3>
                          <div className="mb-2">
                            <span className="text-4xl font-extrabold text-emerald-400">{formatPrice(plan.price, plan.duration)}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{plan.description}</p>
                        </div>

                        <ul className="space-y-4 mb-8">
                          <li className="flex items-center text-gray-300">
                            <FiCheck className="text-emerald-400 mr-3 flex-shrink-0" />
                            <span>
                              {plan.features && typeof plan.features.interviews === 'number'
                                ? `${plan.features.interviews} interviews`
                                : 'Interviews illimités'}
                            </span>
                          </li>
                          <li className="flex items-center text-gray-300">
                            <FiCheck className="text-emerald-400 mr-3 flex-shrink-0" />
                            <span>Stockage {plan.features?.storage || 'Standard'}</span>
                          </li>
                          <li className="flex items-center text-gray-300">
                            <FiCheck className="text-emerald-400 mr-3 flex-shrink-0" />
                            <span>Support {plan.features?.support || 'Email'}</span>
                          </li>
                          {plan.features?.team && (
                            <li className="flex items-center text-gray-300">
                              <FiCheck className="text-emerald-400 mr-3 flex-shrink-0" />
                              <span>Gestion d'équipe</span>
                            </li>
                          )}
                        </ul>

                        <Link href="/payment">
                          <button className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${
                            isPopular 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-emerald-500/25' 
                              : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                          } group-hover:scale-105`}>
                            Choisir ce plan
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Enhanced Why Choose Us Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Pourquoi
              </span>
              <br />
              <span className="text-white">choisir Interv-ia ?</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Notre plateforme transforme votre préparation aux entretiens grâce à des technologies de pointe
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Préparation réaliste", 
                desc: "Des simulations proches des vraies conditions d'entretien pour booster votre confiance et vos performances.",
                icon: "🎯"
              },
              { 
                title: "IA intelligente", 
                desc: "Analyse vocale et textuelle avancée pour un feedback pertinent et précis sur chaque aspect de votre entretien.",
                icon: "🤖"
              },
              { 
                title: "Accessibilité 24/7", 
                desc: "Préparez-vous quand vous voulez, où vous voulez, sur tous vos appareils avec une interface intuitive.",
                icon: "📱"
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 group-hover:scale-105 text-center">
                  <div className="text-4xl mb-6">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-4 text-white">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced FAQ Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Questions
              </span>
              <br />
              <span className="text-white">fréquentes</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              { 
                q: "Est-ce que Interv-ia est gratuit ?", 
                a: "Oui, une version gratuite avec une simulation est disponible pour tester la plateforme et découvrir nos fonctionnalités." 
              },
              { 
                q: "Puis-je utiliser Interv-ia sans micro ?", 
                a: "Absolument ! Une version texte est disponible pour les utilisateurs sans accès vocal, avec les mêmes fonctionnalités d'analyse." 
              },
              { 
                q: "Les feedbacks sont-ils personnalisés ?", 
                a: "Oui, chaque retour est généré automatiquement selon vos réponses, votre secteur d'activité et vos progrès au fil du temps." 
              },
              { 
                q: "Mes données sont-elles sécurisées ?", 
                a: "Nous prenons la sécurité très au sérieux. Toutes vos données sont chiffrées et nous ne partageons jamais vos informations personnelles." 
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <h4 className="font-bold text-lg text-white mb-3">{faq.q}</h4>
                <p className="text-gray-300 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Map Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Notre
              </span>
              <br />
              <span className="text-white">localisation</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Retrouvez-nous ici pour des sessions de coaching IA personnalisées
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <iframe
                title="Interv-ia Map"
                width="100%"
                height="400"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.0596045600713!2d10.64067031494321!3d35.825603080158566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130220619c417201%3A0xf8aa8858019cfc69!2sSousse%2C%20Tunisia!5e0!3m2!1sen!2stn!4v1610106821174!5m2!1sen!2stn"
                className="w-full h-[400px]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 relative border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Image 
                src="/logo.png" 
                alt="Logo Interv-ia" 
                width={120} 
                height={40} 
                className="h-10 w-auto mb-4"
              />
              <p className="text-gray-300 max-w-md leading-relaxed">
                Transformez votre préparation aux entretiens avec notre IA avancée. 
                Des résultats garantis, une expérience unique.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors">Accueil</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Fonctionnalités</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Tarifs</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">À propos</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Suivez-nous</h4>
              <div className="flex space-x-4">
                <SocialIcon href="https://linkedin.com" icon={<FaLinkedin />} />
                <SocialIcon href="https://github.com" icon={<FaGithub />} />
                <SocialIcon href="https://twitter.com" icon={<FaTwitter />} />
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Interv-ia. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Mentions légales</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Politique de confidentialité</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">CGU</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="w-10 h-10 bg-white/10 hover:bg-emerald-500/20 text-white hover:text-emerald-400 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
    >
      {icon}
    </a>
  )
}
