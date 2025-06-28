export const STRIPE_CONFIG = {
  // Replace with your publishable key from environment variables
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51ROLKLP8p87d3gFbRrDxnymVSu5SABzUFoXmeDMJ44wnebLXvrdb7a4Uumu1G9zhdos7lqWz2vv48PByMAIxGWog00rmZV6OmU',
  // API endpoints
  endpoints: {
    createCheckoutSession: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/api/payments/create-checkout-session`,
    getSession: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/api/payments/session`,
    createPaymentIntent: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/api/payments/create-payment-intent`,
  },
  // Currency settings
  currency: 'EUR',
  // Card element options
  cardElementOptions: {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  },
}; 