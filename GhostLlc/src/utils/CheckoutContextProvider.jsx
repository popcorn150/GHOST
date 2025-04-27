/* eslint-disable react/prop-types */
// src/utils/CheckoutContextProvider.jsx
import  { createContext, useContext, useState } from 'react';

// Create context
const CheckoutContext = createContext(null);

// Custom hook to use the checkout context
export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

export const CheckoutProvider = ({ children }) => {
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  
  // Base URL for API - update this to match your server's URL and port
  const API_BASE_URL = 'http://localhost:3001/api';

  // Create a payment intent
  const createPaymentIntent = async (amount, metadata = {}) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents for Stripe
          metadata,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }
      
      const data = await response.json();
      setPaymentIntent(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error creating payment intent:', err);
      return null;
    }
  };

  // Check payment status
  const checkPaymentStatus = async (paymentIntentId) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/payment/${paymentIntentId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payment status');
      }
      
      const data = await response.json();
      setPaymentStatus(data.status);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error checking payment status:', err);
      return null;
    }
  };

  // Release payment from escrow
  const releasePayment = async (paymentIntentId) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/release-escrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to release payment');
      }
      
      const data = await response.json();
      setPaymentStatus('completed');
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error releasing payment:', err);
      return null;
    }
  };

  // Cancel payment
  const cancelPayment = async (paymentIntentId, cancellationReason) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/cancel-escrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId, cancellationReason }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel payment');
      }
      
      const data = await response.json();
      setPaymentStatus('cancelled');
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error cancelling payment:', err);
      return null;
    }
  };

  // Context value
  const value = {
    paymentIntent,
    paymentStatus,
    error,
    createPaymentIntent,
    checkPaymentStatus,
    releasePayment,
    cancelPayment,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};