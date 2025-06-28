'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCheck, FiLoader, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default function PaymentSuccessPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"><span className="text-gray-300">Chargement...</span></div>}>
      <PaymentSuccessPage />
    </Suspense>
  );
}

function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams ? searchParams.get('session_id') : null;
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/session/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch session details');
        }

        const data = await response.json();
        setSession(data.session);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="flex items-center space-x-3">
          <FiLoader className="animate-spin h-8 w-8 text-emerald-400" />
          <span className="text-gray-300">Vérification du paiement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Erreur de vérification
          </h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-12">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Paiement réussi !
            </span>
          </h1>
          <p className="text-gray-300 text-lg">
            Votre abonnement a été activé avec succès.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/10 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            Détails de la transaction
          </h2>
          <div className="space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-300">ID de session:</span>
              <span className="text-white font-mono text-sm">{sessionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Statut:</span>
              <span className="text-emerald-400 font-semibold capitalize">
                {session?.payment_status || 'completed'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Montant:</span>
              <span className="text-white font-semibold">
                {(session?.amount_total || 0) / 100}€
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <FiArrowRight className="w-5 h-5" />
            Accéder au tableau de bord
          </Link>
          
          <div className="text-sm text-gray-400">
            Un email de confirmation vous a été envoyé.
          </div>
        </motion.div>
      </div>
    </div>
  );
} 