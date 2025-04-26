/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { CreditCard, HelpCircle, X } from "lucide-react";
import NavBar from "../components/NavBar";
import { useCheckout } from "../utils/CheckoutContextProvider";

// Reusable input component to reduce repetition
const FormInput = ({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  readOnly = false,
}) => (
  <input
    type={type}
    placeholder={placeholder}
    className={`w-full outline-none ${className}`}
    value={value}
    onChange={onChange}
    required={value !== undefined}
    readOnly={readOnly}
  />
);

// Reusable section header component
const SectionHeader = ({ title, subtitle }) => (
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">{title}</h2>
    {subtitle && <span className="text-blue-400 text-sm">{subtitle}</span>}
  </div>
);

// Card Input Component for Stripe Elements
const CardSection = () => {
  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  };

  return (
    <div className="border border-gray-300 rounded p-3">
      <CardElement options={CARD_ELEMENT_OPTIONS} />
    </div>
  );
};

export default function CheckoutPage() {
  // Add error handling for context hooks
  const stripe = useStripe();
  const elements = useElements();
  
  // Check if import path is correct - update if needed
  const checkoutContext = useCheckout();
  
  // Destructure safely with fallbacks to prevent null errors
  const {
    createPaymentIntent = async () => {},
    paymentIntent = null,
    paymentStatus = null,
    error: contextError = null,
    checkPaymentStatus = async () => {},
    releasePayment = async () => {},
    cancelPayment = async () => {},
  } = checkoutContext || {};

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [showModal, setShowModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderTotal] = useState(395.0); // Example order total

  // Create payment intent when component mounts
  useEffect(() => {
    const initializePaymentIntent = async () => {
      await createPaymentIntent(orderTotal, {
        customerEmail: email,
        productInfo: "Product purchase",
      });
    };

    if (email && orderTotal && !paymentIntent) {
      initializePaymentIntent();
    }
  }, [email, orderTotal, createPaymentIntent, paymentIntent]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !paymentIntent) {
      setPaymentError("Payment processing is not ready yet. Please try again.");
      return;
    }

    // Get card element
    const cardElement = elements.getElement(CardElement);

    // Use Stripe.js to handle card payment
    const result = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name,
          email,
          address: {
            line1: address,
            // Add other address fields as needed
          },
        },
      },
    });

    if (result.error) {
      setPaymentError(result.error.message);
      setProcessingPayment(false);
    } else {
      // The payment is now in escrow (authorized but not captured)
      setPaymentSuccess(true);
      setShowModal(true);

      // Check payment status
      await checkPaymentStatus(paymentIntent.paymentIntentId);

      setProcessingPayment(false);
    }
  };

  // Release payment from escrow (e.g., when goods are delivered or service completed)
  const handleReleasePayment = async () => {
    if (!paymentIntent) return;

    setProcessingPayment(true);
    await releasePayment(paymentIntent.paymentIntentId);
    setProcessingPayment(false);
  };

  // Cancel payment and refund
  const handleCancelPayment = async () => {
    if (!paymentIntent) return;

    setProcessingPayment(true);
    await cancelPayment(
      paymentIntent.paymentIntentId,
      "Customer requested cancellation"
    );
    setProcessingPayment(false);
  };

  // Payment method button component
  const PaymentMethodButton = ({ method, label, icon }) => (
    <button
      type="button"
      className={`flex-1 p-3 flex items-center justify-center ${
        paymentMethod === method ? "bg-gray-100" : "bg-white"
      }`}
      onClick={() => setPaymentMethod(method)}
    >
      {icon && icon}
      <span>{label}</span>
    </button>
  );

  // Show success message after payment processing
  const PaymentStatus = () => {
    let statusMessage = "";
    let statusColor = "";

    switch (paymentStatus) {
      case "requires_capture":
        statusMessage =
          "Payment authorized and in escrow. Will be released when conditions are met.";
        statusColor = "text-yellow-600";
        break;
      case "completed":
        statusMessage = "Payment completed and released from escrow.";
        statusColor = "text-green-600";
        break;
      case "cancelled":
      case "refunded":
        statusMessage = "Payment cancelled and refunded.";
        statusColor = "text-red-600";
        break;
      default:
        statusMessage = "Processing payment...";
        statusColor = "text-blue-600";
    }

    return <div className={`mt-4 ${statusColor}`}>{statusMessage}</div>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {!stripe || !elements ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="p-4 text-center">
            <h2 className="text-xl font-bold mb-2">Loading payment system...</h2>
            <p>Please wait while we set up the secure payment environment.</p>
          </div>
        </div>
      ) : (
        <>
          <NavBar />

          {/* Main Content */}
          <div className="flex-1 flex justify-center p-4">
            <div className="bg-gray-100 w-full max-w-4xl rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 bg-white rounded-lg shadow">
                {/* Breadcrumb */}
                <div className="mb-6 sm:mb-8 flex items-center text-sm">
                  <span className="text-gray-500">Cart</span>
                  <span className="mx-2 text-gray-400">→</span>
                  <span className="font-semibold">Checkout</span>
                </div>

                <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
                  {/* Left Column - Form */}
                  <div className="flex-1">
                    <form onSubmit={handleSubmit}>
                      {/* Contact Info Section */}
                      <div className="mb-6 sm:mb-8">
                        <SectionHeader title="Contact info" />
                        <div className="border border-gray-300 rounded-lg p-3">
                          <FormInput
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Shipping Section */}
                      <div className="mb-6 sm:mb-8">
                        <SectionHeader title="Shipping" />
                        <div className="border border-gray-300 rounded-lg flex flex-col gap-1">
                          <FormInput
                            placeholder="First and last name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="p-3 border-b border-gray-200"
                          />
                          <FormInput
                            placeholder="Shipping address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="p-3"
                          />
                        </div>
                      </div>

                      {/* Payment Section */}
                      <div>
                        <SectionHeader
                          title="Payment"
                          subtitle="Secured by Stripe"
                        />
                        <div className="border border-gray-300 rounded-lg">
                          <div className="flex flex-wrap border-b border-gray-200">
                            <PaymentMethodButton
                              method="card"
                              label="Card"
                              icon={<CreditCard className="mr-2 h-5 w-5" />}
                            />
                            {/* Other payment methods can be added here */}
                            <button type="button" className="px-3 text-gray-500">
                              <HelpCircle className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="p-4">
                            <div className="mb-4">
                              <label className="block text-sm mb-2">
                                Card information
                              </label>
                              <CardSection />
                              <div className="mt-2 text-sm text-gray-500">
                                Your payment will be securely held in escrow until
                                your order is completed.
                              </div>
                            </div>

                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="sameAsShipping"
                                checked={sameAsBilling}
                                onChange={(e) => setSameAsBilling(e.target.checked)} // Use event.target.checked for reliability
                                className="mr-2 h-4 w-4"
                              />
                              <label htmlFor="sameAsShipping" className="text-sm">
                                Billing is same as shipping information
                              </label>
                            </div>

                            {paymentError && (
                              <div className="mt-4 text-red-600 text-sm">
                                {paymentError}
                              </div>
                            )}

                            {contextError && (
                              <div className="mt-4 text-red-600 text-sm">
                                {contextError}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Submit button at the bottom of the form */}
                      <div className="mt-6">
                        <button
                          type="submit"
                          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                          disabled={!stripe || !elements || processingPayment}
                        >
                          {processingPayment
                            ? "Processing..."
                            : "Place Order (Funds in Escrow)"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Column - Order Summary */}
                  <div className="md:w-80">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal (1 item)</span>
                        <span className="font-semibold">
                          ${orderTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-gray-600">Free</span>
                      </div>
                      <div className="border-t border-gray-200 pt-4 mb-6">
                        <div className="flex justify-between">
                          <span className="font-semibold">Total</span>
                          <span className="font-semibold">
                            ${orderTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {paymentStatus && (
                        <div className="mb-4">
                          <PaymentStatus />
                        </div>
                      )}

                      {paymentSuccess && paymentStatus === "requires_capture" && (
                        <div className="flex flex-col gap-2 mt-4">
                          <button
                            type="button"
                            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
                            onClick={handleReleasePayment}
                            disabled={processingPayment}
                          >
                            Release Payment from Escrow
                          </button>
                          <button
                            type="button"
                            className="w-full bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
                            onClick={handleCancelPayment}
                            disabled={processingPayment}
                          >
                            Cancel Order & Refund
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Confirmation Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Payment Status</h3>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => setShowModal(false)}
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="mb-6">
                    {paymentSuccess ? (
                      <div>
                        <div className="flex items-center justify-center mb-4">
                          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                            <svg
                              className="h-10 w-10 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <h4 className="text-lg font-medium text-center mb-2">
                          Payment Authorized
                        </h4>
                        <p className="text-gray-600 text-center">
                          Your payment of ${orderTotal.toFixed(2)} has been
                          authorized and is being held in escrow. The funds will be
                          released to the seller once you confirm receipt of your
                          order.
                        </p>
                        <div className="mt-4">
                          <PaymentStatus />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-center mb-4">
                          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                            <svg
                              className="h-10 w-10 text-red-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <h4 className="text-lg font-medium text-center mb-2">
                          Payment Failed
                        </h4>
                        <p className="text-gray-600 text-center">
                          {paymentError ||
                            "There was an issue processing your payment. Please try again."}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}