//import React from 'react';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutPage from "./CheckoutPage";
import { CheckoutProvider } from "../utils/CheckoutContextProvider";
import ErrorBoundary from "../components/ErrorBoundary";

// Initialize Stripe outside the component
// Make sure to use your actual test key here
const stripePromise = loadStripe("pk_test_51RGpyBRuJ7eSrqtuORWflMauP5pSiSEBcvq5kkaxaxLb6mwfQG67wLmsid2npvFJR1yYSsA3yiuaO9twX3iayAeP00TTTScB2F");

const CheckoutWrapper = () => {
  return (
    <ErrorBoundary>
      <CheckoutProvider>
        <Elements stripe={stripePromise}>
          <CheckoutPage />
        </Elements>
      </CheckoutProvider>
    </ErrorBoundary>
  );
};

export default CheckoutWrapper;