'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import Sidebar from '../components/Sidebar'
import {
  FiSend,
  FiMic,
  FiSquare,
  FiTrash2,
  FiLoader
} from 'react-icons/fi'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { getAuthToken } from '@/utils/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { usePageMetadata, PAGE_METADATA } from '@/utils/pageMetadata'

// Add type definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Update DeepSeek API configuration
const DEEPSEEK_API_KEY = 'sk-453a56943bb64f93b00f3ee2abf6720b'
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

interface Message {
  role: 'user' | 'ai'
  type: 'text' | 'vocal'
  content: string
  label?: string
  audioUrl?: string
}

export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-100"><span className="text-gray-500">Chargement...</span></div>}>
      <ChatPage />
    </Suspense>
  );
}

function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [discussionId, setDiscussionId] = useState<number | null>(null)
  const [discussionTitle, setDiscussionTitle] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingResponse, setIsLoadingResponse] = useState(false)
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isVoiceSupported, setIsVoiceSupported] = useState(true)
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [showPermissionAlert, setShowPermissionAlert] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const SILENCE_TIMEOUT = 1500 // 1.5 seconds

  // Use the page metadata hook
  usePageMetadata(PAGE_METADATA.CHAT)

  useEffect(() => {
    const id = searchParams?.get('id')
    
    if (id) {
      loadDiscussion(parseInt(id))
    } else {
      createNewDiscussion()
    }
  }, [searchParams])

  useEffect(() => {
    // Check microphone permission status
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(permissionStatus => {
          setMicPermission(permissionStatus.state)
          
          permissionStatus.onchange = () => {
            setMicPermission(permissionStatus.state)
          }
        })
        .catch(() => {
          // Some browsers don't support permissions API
          setMicPermission('prompt')
        })
    }
  }, [])

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.lang = 'fr-FR'
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = ''
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript
          }
          setTranscript(currentTranscript)

          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
          }

          if (event.results[event.results.length - 1].isFinal) {
            silenceTimerRef.current = setTimeout(() => {
              if (currentTranscript.trim()) {
                handleVoiceMessage(currentTranscript)
              }
            }, SILENCE_TIMEOUT)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsRecording(false)
          
          if (event.error === 'not-allowed') {
            setMicPermission('denied')
            setShowPermissionAlert(true)
          }
        }

        recognitionRef.current.onend = () => {
          if (isRecording) {
            try {
              recognitionRef.current.start()
            } catch (error) {
              console.error('Error restarting recognition:', error)
              setIsRecording(false)
            }
          }
        }
      }
    }
  }, [])

  const loadDiscussion = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discussions/${id}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })

      if (response.status === 404) {
        setError('Discussion non trouvée')
        router.push('/all')
        return
      }

      if (response.status === 403) {
        setError('Vous n\'avez pas accès à cette discussion')
        router.push('/all')
        return
      }

      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la discussion')
      }

      const discussion = await response.json()
      setDiscussionId(discussion.id)
      setDiscussionTitle(discussion.title)
      setMessages(discussion.Messages || [])
    } catch (error) {
      console.error('Error loading discussion:', error)
      setError('Erreur lors du chargement de la discussion')
    } finally {
      setLoading(false)
    }
  }

  const createNewDiscussion = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          title: 'Nouvelle discussion'
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la discussion')
      }

      const discussion = await response.json()
      setDiscussionId(discussion.id)
      setDiscussionTitle(discussion.title)
      setMessages([])
      
      // Update URL with the new discussion ID
      router.push(`/chat?id=${discussion.id}`)
    } catch (error) {
      console.error('Error creating discussion:', error)
      setError('Erreur lors de la création de la discussion')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (content: string, role: 'user' | 'ai' = 'user') => {
    if (!content.trim()) return

    const newMessage: Message = {
      role,
      type: 'text',
      content: content.trim()
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')

    if (role === 'user') {
      setIsTyping(true)
      setIsLoadingResponse(true)
      
      // Create a placeholder AI message for streaming
      const streamingMessage: Message = {
        role: 'ai',
        type: 'text',
        content: ''
      }
      setMessages(prev => [...prev, streamingMessage])
      
      // Check if API key is configured
      if (!DEEPSEEK_API_KEY) {
        console.error('DeepSeek API key is not configured')
        setIsTyping(false)
        setIsLoadingResponse(false)
        // Update the streaming message with error
        setMessages(prev => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage && lastMessage.role === 'ai') {
            lastMessage.content = 'Erreur de configuration: Clé API DeepSeek manquante. Veuillez configurer votre clé API.'
          }
          return newMessages
        })
        return
      }
      
      try {
        console.log('Sending streaming request to DeepSeek API...')
        
        const response = await fetch(DEEPSEEK_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: `Tu es un expert coach d'entretien d'embauche professionnel avec plus de 15 ans d'expérience en recrutement et en préparation de candidats. Tu aides les candidats à exceller dans leurs entretiens d'embauche.

TON RÔLE PRINCIPAL :
- Préparer les candidats pour tous types d'entretiens (technique, comportemental, RH, final)
- Simuler des entretiens réalistes avec des questions authentiques
- Donner des conseils personnalisés et constructifs
- Analyser les réponses et proposer des améliorations
- Aider à la préparation mentale et à la gestion du stress

MÉTHODOLOGIE D'INTERVENTION :

1. **ÉVALUATION INITIALE** :
   - Identifier le poste visé, l'expérience du candidat, le secteur d'activité
   - Comprendre les forces et faiblesses du candidat
   - Adapter l'approche selon le niveau (junior, confirmé, senior)

2. **SIMULATION D'ENTRETIEN** :
   - Poser des questions réalistes et pertinentes selon le poste
   - Varier les types de questions : techniques, comportementales, situationnelles
   - Créer un environnement d'entretien authentique
   - Donner du feedback immédiat et constructif

3. **COACHING PERSONNALISÉ** :
   - Analyser chaque réponse en détail
   - Identifier les points d'amélioration
   - Proposer des formulations alternatives
   - Donner des exemples concrets et des techniques

4. **PRÉPARATION COMPLÈTE** :
   - Questions fréquentes par secteur/métier
   - Techniques de réponse (STAR, PAR, etc.)
   - Gestion du stress et de la communication non-verbale
   - Questions à poser au recruteur

RÈGLES DE COMMUNICATION :
- Sois encourageant mais honnête
- Donne des feedbacks constructifs et spécifiques
- Utilise un ton professionnel mais accessible
- Adapte ton langage au niveau du candidat
- Pose des questions de clarification si nécessaire
- Fournis des exemples concrets et des techniques pratiques

STRUCTURE DES RÉPONSES :
1. **Analyse** : Évalue la réponse donnée
2. **Points positifs** : Souligne ce qui fonctionne bien
3. **Améliorations** : Propose des pistes d'amélioration
4. **Exemple** : Donne une formulation alternative
5. **Technique** : Explique une méthode ou technique utile

SPÉCIALISATIONS PAR SECTEUR :
- Tech/IT : Questions techniques, projets, stack technologique
- Marketing/Communication : Stratégies, campagnes, ROI
- Finance/Comptabilité : Analyses financières, réglementation
- RH/Management : Gestion d'équipe, résolution de conflits
- Vente/Commercial : Techniques de vente, objectifs, CRM
- Production/Logistique : Processus, optimisation, qualité

Tu peux aussi aider avec :
- Préparation de CV et lettre de motivation
- Techniques de négociation salariale
- Préparation aux tests psychométriques
- Gestion des questions pièges
- Préparation aux entretiens vidéo/à distance

Commence par te présenter et proposer au candidat de commencer une simulation d'entretien ou de poser des questions spécifiques sur sa préparation.`
              },
              ...messages.map(msg => ({
                role: msg.role === 'ai' ? 'assistant' : msg.role,
                content: msg.content
              })),
              {
                role: 'user',
                content: content.trim()
              }
            ],
            max_tokens: 1000,
            temperature: 0.7,
            stream: true // Enable streaming
          })
        })

        console.log('DeepSeek API response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('DeepSeek API error response:', errorText)
          throw new Error(`Erreur API (${response.status}): ${errorText}`)
        }

        // Stop loading and start streaming
        setIsLoadingResponse(false)

        // Handle streaming response
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let fullResponse = ''

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read()
              
              if (done) break
              
              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  
                  if (data === '[DONE]') {
                    // Streaming complete
                    break
                  }
                  
                  try {
                    const parsed = JSON.parse(data)
                    if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                      const content = parsed.choices[0].delta.content
                      fullResponse += content
                      
                      // Update the streaming message in real-time
                      setMessages(prev => {
                        const newMessages = [...prev]
                        const lastMessage = newMessages[newMessages.length - 1]
                        if (lastMessage && lastMessage.role === 'ai') {
                          lastMessage.content = fullResponse
                        }
                        return newMessages
                      })
                    }
                  } catch (parseError) {
                    console.error('Error parsing streaming data:', parseError)
                  }
                }
              }
            }
          } finally {
            reader.releaseLock()
          }
        }

        // Save user message to backend
        if (discussionId) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discussions/${discussionId}/messages`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
              },
              body: JSON.stringify({
                content: content.trim(),
                role: 'user'
              })
            })
          } catch (backendError) {
            console.error('Error saving user message to backend:', backendError)
          }
        }

        // Save AI message to backend
        if (discussionId && fullResponse) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discussions/${discussionId}/messages`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
              },
              body: JSON.stringify({
                content: fullResponse,
                role: 'ai'
              })
            })
          } catch (backendError) {
            console.error('Error saving AI message to backend:', backendError)
          }
        }

        setIsTyping(false)
      } catch (error) {
        console.error('Error sending message:', error)
        setIsTyping(false)
        setIsLoadingResponse(false)
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
        // Update the streaming message with error
        setMessages(prev => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage && lastMessage.role === 'ai') {
            lastMessage.content = `Désolé, une erreur s'est produite: ${errorMessage}`
          }
          return newMessages
        })
      }
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return
    await sendMessage(input)
  }

  const handleMicClick = async () => {
    if (isRecording) {
      stopRecording()
    } else {
      await toggleRecording()
    }
  }

  const updateDiscussionTitle = async () => {
    if (!newTitle.trim() || !discussionId) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/discussions/${discussionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          title: newTitle.trim()
        })
      })

      if (response.ok) {
        setDiscussionTitle(newTitle.trim())
        setIsEditingTitle(false)
        setNewTitle('')
      } else {
        throw new Error('Erreur lors de la mise à jour du titre')
      }
    } catch (error) {
      console.error('Error updating title:', error)
      alert('Erreur lors de la mise à jour du titre')
    }
  }

  const handleVoiceMessage = async (message: string) => {
    if (!message.trim()) return

    // Stop recording
    stopRecording()
    setTranscript('')

    // Send the voice message as text
    await sendMessage(message)
  }

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording()
      return
    }

    if (micPermission === 'denied') {
      setShowPermissionAlert(true)
      return
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsRecording(true)
        setTranscript('') // Clear any previous transcript
      } else {
        // Fallback to audio recording if speech recognition is not available
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          const audioUrl = URL.createObjectURL(audioBlob)
          
          const newMessage: Message = {
            role: 'user',
            type: 'vocal',
            content: 'Message vocal',
            label: '🎙️ Message vocal',
            audioUrl
          }
          
          setMessages(prev => [...prev, newMessage])
          
          // Here you would typically send the audio to a speech-to-text service
          // For now, we'll just add it as a voice message
        }

        mediaRecorder.start()
        setRecording(true)
      }
    } catch (error) {
      console.error('Error starting recording:', error)
      setMicPermission('denied')
      setShowPermissionAlert(true)
    }
  }

  const stopRecording = () => {
    try {
      recognitionRef.current?.stop()
      setIsRecording(false)
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    } catch (error) {
      console.error('Error stopping recording:', error)
    }
  }

  const addMessage = (role: 'user' | 'ai', content: string) => {
    const newMessage: Message = {
      role,
      type: 'text',
      content
    }
    setMessages(prev => [...prev, newMessage])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <FiLoader className="animate-spin h-8 w-8 text-emerald-400" />
            <span className="text-gray-300">Chargement de la discussion...</span>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Link href="/all" className="text-emerald-400 hover:text-emerald-300">
              Retour aux discussions
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen md:ml-80 mt-2.5 sm:mt-0">
        <header className="p-4 sm:p-6 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Nouveau titre"
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300"
                autoFocus
              />
              <button
                onClick={updateDiscussionTitle}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-emerald-500/25 transition-all duration-300"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => {
                  setIsEditingTitle(false);
                  setNewTitle('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {discussionTitle}
                </span>
                <button
                  onClick={() => {
                    setNewTitle(discussionTitle);
                    setIsEditingTitle(true);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✏️
                </button>
              </h1>
            </div>
          )}
        </header>

        {/* Scrollable Messages Area */}
        <div className="px-4 sm:px-6 py-4 space-y-4 h-[calc(100vh-200px)] sm:h-[calc(100vh-200px)] overflow-y-auto">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-end gap-3 ${msg.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <img
                src={msg.role === 'ai'
                  ? 'https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg'
                  : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUzrFare_5CyMjWesMywY_omXYQ9uuChSn4w&s'}
                className="w-10 h-10 rounded-full border border-white/20"
                alt="avatar"
              />
              <div
                className={`px-5 py-3 rounded-2xl text-sm shadow-lg ${
                  msg.role === 'ai' 
                    ? 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-bl-none' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 rounded-br-none'
                }`}
              >
                {msg.type === 'text' ? (
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-white/70 mb-1">{msg.label || '🎙️ Message vocal'}</p>
                    <audio controls className="w-full">
                      <source src={msg.audioUrl} type="audio/webm" />
                      Votre navigateur ne supporte pas l'audio.
                    </audio>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {showPermissionAlert && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl text-sm text-white backdrop-blur-xl"
            >
              <p className="font-medium mb-2">Accès au microphone requis</p>
              <p>Pour utiliser la reconnaissance vocale, veuillez :</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Cliquer sur l'icône 🔒 dans la barre d'adresse</li>
                <li>Autoriser l'accès au microphone</li>
                <li>Cliquer sur le bouton microphone pour réessayer</li>
              </ol>
              <button 
                onClick={() => setShowPermissionAlert(false)}
                className="mt-3 text-sm text-white/70 hover:text-white transition-colors"
              >
                Fermer
              </button>
            </motion.div>
          )}

          {transcript && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 p-3 rounded-xl text-sm text-gray-300 text-center backdrop-blur-xl border border-white/10"
            >
              {transcript || "Je vous écoute..."}
            </motion.div>
          )}

          {isLoadingResponse && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-3"
            >
              <img
                src="https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg"
                className="w-10 h-10 rounded-full border border-white/20"
                alt="avatar"
              />
              <div className="px-5 py-3 rounded-2xl text-sm shadow-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-bl-none">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Section */}
        <div className="fixed bottom-0 left-0 md:left-80 right-0 backdrop-blur-xl px-4 sm:px-6 py-4 flex items-center gap-3 border-white/10 z-50">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => !isTyping && e.key === 'Enter' && handleSendMessage()}
            placeholder={isTyping ? "Assistant est en train d'écrire..." : "Écrivez votre message..."}
            disabled={isTyping}
            className="flex-1 px-4 py-3 rounded-full border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isTyping}
            className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/25"
          >
            <FiSend size={20} />
          </button>
          <button
            onClick={toggleRecording}
            disabled={isTyping}
            className={`p-3 rounded-full hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
              isRecording 
                ? 'bg-red-500 hover:shadow-red-500/25' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-emerald-500/25'
            }`}
            title={isRecording ? "Cliquez pour envoyer le message" : "Cliquez pour commencer à parler"}
          >
            <FiMic size={20} />
          </button>
        </div>
      </main>
    </div>
  )
}

