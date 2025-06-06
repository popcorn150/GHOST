// AccountDetailsDefault.jsx
import { useOutletContext } from "react-router-dom";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { db } from "../database/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

// Currency conversion utilities
const getCurrencyByCountry = (countryCode) => {
  const currencyMap = {
    US: "USD",
    GB: "GBP",
    EU: "EUR",
    DE: "EUR",
    FR: "EUR",
    IT: "EUR",
    ES: "EUR",
    CA: "CAD",
    AU: "AUD",
    JP: "JPY",
    CN: "CNY",
    IN: "INR",
    BR: "BRL",
    RU: "RUB",
    KR: "KRW",
    MX: "MXN",
    ZA: "ZAR",
    NG: "NGN",
    KE: "KES",
    GH: "GHS",
    EG: "EGP",
    MA: "MAD",
    TZ: "TZS",
    UG: "UGX",
    ZM: "ZMW",
    ZW: "ZWL",
    BW: "BWP",
    MW: "MWK",
    MZ: "MZN",
    AO: "AOA",
    ET: "ETB",
  };
  return currencyMap[countryCode] || "USD";
};

const detectUserLocation = async () => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return {
      country: data.country_code,
      currency: getCurrencyByCountry(data.country_code),
    };
  } catch (error) {
    console.error("Error detecting location:", error);
    const locale = navigator.language || navigator.languages[0];
    const countryCode = locale.split("-")[1] || "US";
    return {
      country: countryCode,
      currency: getCurrencyByCountry(countryCode),
    };
  }
};

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;

  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    );
    const data = await response.json();

    if (data.rates && data.rates[toCurrency]) {
      return amount * data.rates[toCurrency];
    }

    const fallbackResponse = await fetch(
      `https://api.fxratesapi.com/latest?base=${fromCurrency}&symbols=${toCurrency}`
    );
    const fallbackData = await fallbackResponse.json();

    if (fallbackData.rates && fallbackData.rates[toCurrency]) {
      return amount * fallbackData.rates[toCurrency];
    }

    throw new Error("Currency conversion failed");
  } catch (error) {
    console.error("Currency conversion error:", error);
    return amount;
  }
};

const formatCurrency = (amount, currency) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

const AccountDetailsDefault = () => {
  const {
    account,
    isPurchased,
    renderCredentials,
    handleAddToCart,
    handlePurchase: originalHandlePurchase,
    isInCart,
    currentUser,
    handleContinue,
    paymentReference,
  } = useOutletContext();

  const [userCurrency, setUserCurrency] = useState("USD");
  const [convertedPrice, setConvertedPrice] = useState(null);
  const [originalCurrency, setOriginalCurrency] = useState("USD");
  const [loadingCurrency, setLoadingCurrency] = useState(true);

  useEffect(() => {
    const setupCurrency = async () => {
      try {
        const location = await detectUserLocation();
        setUserCurrency(location.currency);
        setOriginalCurrency(account.currency || "USD");
        console.log("Detected user currency:", location.currency);
      } catch (error) {
        console.error("Error setting up currency:", error);
        setUserCurrency("USD");
      } finally {
        setLoadingCurrency(false);
      }
    };

    setupCurrency();
  }, [account]);

  useEffect(() => {
    const performCurrencyConversion = async () => {
      if (account && account.accountWorth && !loadingCurrency) {
        try {
          if (originalCurrency !== userCurrency) {
            console.log(
              `Converting ${account.accountWorth} from ${originalCurrency} to ${userCurrency}`
            );
            const converted = await convertCurrency(
              account.accountWorth,
              originalCurrency,
              userCurrency
            );
            setConvertedPrice(converted);
          } else {
            setConvertedPrice(account.accountWorth);
          }
        } catch (error) {
          console.error("Error converting currency:", error);
          setConvertedPrice(account.accountWorth);
        }
      }
    };

    performCurrencyConversion();
  }, [account, userCurrency, originalCurrency, loadingCurrency]);

  // Enhanced purchase handler
  const handlePurchase = async () => {
    try {
      await originalHandlePurchase();

      // Mark the account as sold in Firestore
      if (account.isFromFirestore) {
        const accountRef = doc(db, "accounts", account.id);
        await updateDoc(accountRef, {
          sold: true,
          soldAt: new Date().toISOString(),
          buyerId: currentUser.uid,
        });
        console.log(`Marked account ${account.id} as sold in Firestore`);
      }
    } catch (error) {
      console.error("Error during purchase:", error);
      toast.error("Purchase failed. Please try again.");
    }
  };

  const renderPrice = () => {
    if (!account.accountWorth) return null;

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-[#0576FF] mb-2">
          Account Worth
        </h3>
        {convertedPrice !== null ? (
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-[#0576FF] font-medium">
                {userCurrency}
              </span>
              <span className="text-2xl text-[#0576FF] font-bold">
                {new Intl.NumberFormat("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }).format(convertedPrice)}
              </span>
            </div>
            {originalCurrency !== userCurrency && (
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xs text-gray-500">Original:</span>
                <span className="text-xs text-gray-500 font-medium">
                  {originalCurrency}
                </span>
                <span className="text-xs text-gray-400">
                  {new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  }).format(account.accountWorth)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="animate-pulse bg-gray-600 h-6 w-24 rounded"></div>
            <span className="text-sm text-gray-400">Converting...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Toaster richColors position="top-center" />
      <p className="text-gray-300 text-sm sm:text-base">{account.details}</p>

      {renderPrice()}

      {renderCredentials()}

      {account.createdAt && (
        <div className="mt-6">
          <p className="text-gray-400 text-sm">
            Listed on{" "}
            {new Date(
              account.createdAt.seconds
                ? account.createdAt.seconds * 1000
                : account.createdAt
            ).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <button
          onClick={handleAddToCart}
          disabled={isInCart || isPurchased}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200
            ${
              isInCart || isPurchased
                ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-gray-700 text-blue-300 border border-blue-500/30 hover:bg-gray-600 hover:border-blue-400"
            }`}
          aria-label={
            isInCart
              ? "Item in cart"
              : isPurchased
              ? "Purchased"
              : "Add to cart"
          }
        >
          {isInCart ? (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>In Cart</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span>Add to Cart</span>
            </>
          )}
        </button>
        <button
          onClick={handlePurchase}
          disabled={isPurchased}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200
            ${
              isPurchased
                ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-[#0576FF] text-white hover:bg-[#0465db]"
            }`}
          aria-label={isPurchased ? "Purchased" : "Purchase account"}
        >
          {isPurchased ? (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Purchased</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Purchase</span>
            </>
          )}
        </button>
        {isPurchased && currentUser && paymentReference && (
          <button
            onClick={handleContinue}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 bg-green-600 text-white hover:bg-green-700"
            aria-label="Continue to linked accounts"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            <span>Continue</span>
          </button>
        )}
      </div>
    </>
  );
};

export default AccountDetailsDefault;
