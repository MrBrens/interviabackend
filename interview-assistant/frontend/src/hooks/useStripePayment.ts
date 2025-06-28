import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { STRIPE_CONFIG } from '@/config/stripe';

interface UseStripePaymentProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useStripePayment = ({ onSuccess, onError }: UseStripePaymentProps = {}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async (planId: number, amount: number) => {
    if (!stripe || !elements) {
      setError('Stripe n\'est pas initialisé');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch(STRIPE_CONFIG.endpoints.createPaymentIntent, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planId,
          amount: Math.round(amount * 100) // Convert to cents
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue lors de la création du paiement');
      }

      const { clientSecret } = data;

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          }
        }
      );

      if (stripeError) {
        const errorMessage = stripeError.message || 'Une erreur est survenue lors du paiement';
        setError(errorMessage);
        onError?.(errorMessage);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess?.();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors du paiement';
      console.error('Payment error:', err);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return {
    handlePayment,
    processing,
    error,
  };
}; 