const express = require('express');
const router = express.Router();

// Debug: Log the Stripe secret key (first few characters only)
console.log('Stripe Secret Key loaded:', process.env.STRIPE_SECRET_KEY ? 
  process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...' : 'NOT FOUND');

// Use environment variable for Stripe secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY environment variable is not set');
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}
const stripe = require('stripe')(stripeSecretKey);

const { authMiddleware } = require('../middleware/authMiddleware');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');

// Create Stripe Checkout session
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body;
    console.log('Creating checkout session for planId:', planId);
    console.log('User ID:', req.user.id);

    // Get the plan details
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      console.log('Plan not found for ID:', planId);
      return res.status(404).json({ message: 'Plan not found' });
    }
    console.log('Plan found:', { id: plan.id, name: plan.name, price: plan.price });

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: Math.round(parseFloat(plan.price) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payment?canceled=true`,
      metadata: {
        planId: planId.toString(),
        userId: req.user.id.toString(),
      },
    });

    console.log('Checkout session created successfully:', session.id);
    res.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code
    });
    res.status(500).json({ message: 'Error creating checkout session' });
  }
});

// Handle successful payment webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!endpointSecret) {
    console.error('STRIPE_WEBHOOK_SECRET environment variable is not set');
    return res.status(500).json({ message: 'Webhook secret not configured' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      try {
        // Get the plan
        const plan = await Plan.findByPk(session.metadata.planId);
        if (!plan) {
          console.error('Plan not found for session:', session.id);
          return res.status(404).json({ message: 'Plan not found' });
        }

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration);

        // Create subscription
        await Subscription.create({
          userId: parseInt(session.metadata.userId),
          planId: plan.id,
          startDate,
          endDate,
          status: 'active',
          stripeSessionId: session.id
        });

        console.log('Subscription created successfully for session:', session.id);
      } catch (error) {
        console.error('Error creating subscription:', error);
      }
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Get session details
router.get('/session/:sessionId', authMiddleware, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json({ session });
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ message: 'Error retrieving session' });
  }
});

module.exports = router; 