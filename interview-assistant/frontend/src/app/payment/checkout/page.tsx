'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCreditCard, FiLock, FiCheck, FiLoader, FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';

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

const CheckoutButton = ({ plan, onSuccess }: { plan: Plan; onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: plan.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('Checkout error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-xl"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full py-4 px-6 rounded-xl text-white font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl ${
          loading 
            ? 'bg-gray-500 cursor-not-allowed' 
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 hover:scale-105'
        }`}
      >
        {loading ? (
          <>
            <FiLoader className="w-5 h-5 animate-spin" />
            <span>Redirection vers Stripe...</span>
          </>
        ) : (
          <>
            <FiExternalLink className="w-5 h-5" />
            <span>Payer {plan.price}€ avec Stripe</span>
          </>
        )}
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center text-sm text-gray-400"
      >
        <FiLock className="w-4 h-4 mr-2" />
        Paiement sécurisé par Stripe
      </motion.div>
    </div>
  );
};

export default function CheckoutPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const planId = new URLSearchParams(window.location.search).get('planId');
    if (!planId) {
      router.push('/payment');
      return;
    }

    const fetchPlan = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          router.push('/login');
          return;
        }

        console.log('Fetching plan with ID:', planId);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plans/${planId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch plan');
        }

        const data = await response.json();
        console.log('Plan data received:', data);
        setPlan(data);
      } catch (error) {
        console.error('Error fetching plan:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch plan details');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [router]);

  const handlePaymentSuccess = () => {
    router.push('/payment/success');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="flex items-center space-x-3">
          <FiLoader className="animate-spin h-8 w-8 text-emerald-400" />
          <span className="text-gray-300">Chargement du plan...</span>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Plan non trouvé
          </h2>
          <Link
            href="/payment"
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Retour aux plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/payment"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Retour aux plans
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Finaliser votre abonnement
            </span>
          </h1>
          <p className="text-gray-300">
            Plan {plan.name} - {plan.price}€ / {plan.duration} jours
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/10 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Récapitulatif
            </h2>
            <span className="text-2xl font-bold text-emerald-400">
              {plan.price}€
            </span>
          </div>

          <div className="space-y-4">
            {plan.features && Object.entries(plan.features).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center text-gray-300"
              >
                <FiCheck className="w-5 h-5 text-emerald-400 mr-3" />
                <span className="capitalize">
                  {key === 'interviews' 
                    ? typeof value === 'number' 
                      ? `${value} interviews` 
                      : 'Interviews illimités'
                    : key === 'storage'
                    ? `Stockage ${value}`
                    : key === 'support'
                    ? `Support ${value}`
                    : key === 'team'
                    ? 'Gestion d\'équipe'
                    : `${key}: ${value}`}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <CheckoutButton plan={plan} onSuccess={handlePaymentSuccess} />
      </div>
    </div>
  );
} 