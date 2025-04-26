// server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

console.log('Starting server...');
try {
  require('dotenv').config(); // Load environment variables
  console.log('Environment loaded');
  
  // Check if stripe key exists
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('ERROR: STRIPE_SECRET_KEY not found in environment variables');
    process.exit(1); // Exit with error
  }
  
  const express = require('express');
  const cors = require('cors');
  const bodyParser = require('body-parser');
  
  console.log('Initializing Stripe with key:', process.env.STRIPE_SECRET_KEY.substring(0, 5) + '...');
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  console.log('Creating Express app...');
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  
  // Add a simple test route
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
  });

// Create a payment intent (step 1 of the payment process)
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    // Create the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency,
      metadata: {
        ...metadata,
        escrow: 'true', // Flag this as an escrow payment
        release_status: 'pending' // Initial status
      },
      capture_method: 'manual', // This allows us to authorize now but capture later (escrow)
    });

    // Return the client secret to the frontend
    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Capture the payment (release from escrow)
app.post('/api/release-escrow', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }
    
    // Verify the payment intent exists and is in escrow
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.metadata.escrow !== 'true' || paymentIntent.status !== 'requires_capture') {
      return res.status(400).json({ error: 'Invalid payment intent or not in escrow' });
    }
    
    // Capture the payment (release funds from escrow)
    const capturedPayment = await stripe.paymentIntents.capture(paymentIntentId);
    
    // Update the metadata
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        ...paymentIntent.metadata,
        release_status: 'completed',
        released_at: new Date().toISOString()
      }
    });
    
    res.json({ success: true, payment: capturedPayment });
  } catch (error) {
    console.error('Error releasing escrow payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel escrow and refund payment
app.post('/api/cancel-escrow', async (req, res) => {
  try {
    const { paymentIntentId, cancellationReason } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }
    
    // Verify the payment intent exists and is in escrow
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.metadata.escrow !== 'true') {
      return res.status(400).json({ error: 'Invalid payment intent or not in escrow' });
    }
    
    // For authorized but not captured payments, we need to cancel
    if (paymentIntent.status === 'requires_capture') {
      const canceledPayment = await stripe.paymentIntents.cancel(paymentIntentId);
      
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: {
          ...paymentIntent.metadata,
          release_status: 'cancelled',
          cancellation_reason: cancellationReason || 'not_specified',
          cancelled_at: new Date().toISOString()
        }
      });
      
      return res.json({ success: true, payment: canceledPayment });
    }
    
    // For captured payments, we need to refund
    if (paymentIntent.status === 'succeeded') {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: 'requested_by_customer'
      });
      
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: {
          ...paymentIntent.metadata,
          release_status: 'refunded',
          refund_reason: cancellationReason || 'not_specified',
          refunded_at: new Date().toISOString()
        }
      });
      
      return res.json({ success: true, refund });
    }
    
    res.status(400).json({ error: 'Payment not in a state that can be cancelled' });
  } catch (error) {
    console.error('Error cancelling escrow payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle Stripe webhooks - Note we need the raw body for signature verification
const webhookHandler = express.raw({type: 'application/json'});
app.post('/api/webhook', webhookHandler, async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle specific events
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      // Handle successful payment (e.g., update order status in your database)
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id, failedPayment.last_payment_error?.message);
      // Handle failed payment
      break;
    // Add other event types as needed
  }

  res.json({received: true});
});

// Get payment status (for checking escrow status)
app.get('/api/payment/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      escrowStatus: paymentIntent.metadata.release_status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      paymentMethod: paymentIntent.payment_method,
      created: paymentIntent.created
    });
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    if (error.code === 'resource_missing') {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
  console.log(`Attempting to start server on port ${PORT}...`);
  
  // Start the server
  const server = app.listen(PORT, () => {
    console.log(`Escrow payment server running on port ${PORT}`);
  });
  
  // Add error handler
  server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Try another port.`);
    }
  });
  
} catch (error) {
  console.error('CRITICAL ERROR:', error);
}