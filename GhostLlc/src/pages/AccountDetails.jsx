import "../App.css";
import { useParams, Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import BackButton from "../components/BackButton";
import { AdminIcon } from "../AdminIcon";
import { fetchAccountByIdWithImages } from "../utils/firebaseUtils";
import { useAuth } from "../components/AuthContext";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import { Toaster, toast } from "sonner";

// Fallback image URL if AdminIcon is undefined
const FALLBACK_IMAGE = "https://via.placeholder.com/150?text=Placeholder";

// LocalStorage utility functions with error handling
const safeLocalStorageGet = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

const safeLocalStorageSet = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    
    // Check if the serialized data is too large (approximate check)
    if (serialized.length > 4.5 * 1024 * 1024) { // ~4.5MB limit
      throw new Error('Data too large for localStorage');
    }
    
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    
    if (error.name === 'QuotaExceededError') {
      // Try to clean up old data
      cleanupLocalStorage();
      
      // Try again after cleanup
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (retryError) {
        console.error('Failed to save even after cleanup:', retryError);
        return false;
      }
    }
    return false;
  }
};

const cleanupLocalStorage = () => {
  try {
    console.log('Cleaning up localStorage...');
    
    // List of keys to potentially clean up (add more as needed)
    const keysToClean = [
      'ghost_temp_data',
      'ghost_cache',
      'ghost_old_sessions',
      'ghost_expired_data'
    ];
    
    keysToClean.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Optionally, keep only the most recent cart items
    const cart = safeLocalStorageGet('ghost_cart', []);
    if (cart.length > 50) { // Keep only last 50 items
      const trimmedCart = cart.slice(-50);
      localStorage.setItem('ghost_cart', JSON.stringify(trimmedCart));
      console.log(`Trimmed cart from ${cart.length} to ${trimmedCart.length} items`);
    }
    
    // Do the same for purchased items
    const purchased = safeLocalStorageGet('ghost_purchased', []);
    if (purchased.length > 100) { // Keep only last 100 purchases
      const trimmedPurchased = purchased.slice(-100);
      localStorage.setItem('ghost_purchased', JSON.stringify(trimmedPurchased));
      console.log(`Trimmed purchased from ${purchased.length} to ${trimmedPurchased.length} items`);
    }
    
    console.log('LocalStorage cleanup completed');
  } catch (error) {
    console.error('Error during localStorage cleanup:', error);
  }
};

// Check localStorage usage
const checkLocalStorageUsage = () => {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    
    const usageMB = (total / (1024 * 1024)).toFixed(2);
    console.log(`LocalStorage usage: ${usageMB} MB`);
    
    if (total > 4 * 1024 * 1024) { // Over 4MB
      console.warn('LocalStorage usage is high, consider cleanup');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking localStorage usage:', error);
    return false;
  }
};

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
    toast.error("Unable to convert currency. Showing original price.");
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

const AccountDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loadingImages, setLoadingImages] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  // Currency conversion states
  const [userCurrency, setUserCurrency] = useState("USD");
  const [convertedPrice, setConvertedPrice] = useState(null);
  const [originalCurrency, setOriginalCurrency] = useState("USD");
  const [loadingCurrency, setLoadingCurrency] = useState(true);

  useEffect(() => {
    console.log("Current user:", currentUser);
    // Check localStorage usage on component mount
    checkLocalStorageUsage();
  }, [currentUser]);

  // Detect user's currency on component mount
  useEffect(() => {
    const setupCurrency = async () => {
      try {
        const location = await detectUserLocation();
        setUserCurrency(location.currency);
        console.log("Detected user currency:", location.currency);
      } catch (error) {
        console.error("Error setting up currency:", error);
        setUserCurrency("USD");
      } finally {
        setLoadingCurrency(false);
      }
    };

    setupCurrency();
  }, []);

  useEffect(() => {
    const fetchAccountData = async () => {
      setLoading(true);
      console.log(`Fetching account data for slug: ${slug}`);

      try {
        const firestoreAccount = await fetchAccountByIdWithImages(
          slug,
          currentUser
        );
        console.log("Fetched Firestore account:", firestoreAccount);

        if (firestoreAccount) {
          const foundAccount = {
            id: firestoreAccount.id,
            title: firestoreAccount.accountName || "Untitled Account",
            img: firestoreAccount.accountImage || AdminIcon || FALLBACK_IMAGE,
            details:
              firestoreAccount.accountDescription || "No details available",
            views: firestoreAccount.views || 0,
            accountWorth: firestoreAccount.accountWorth,
            accountCredential: firestoreAccount.accountCredential,
            createdAt: firestoreAccount.createdAt,
            username: firestoreAccount.username || "Ghost",
            userId: firestoreAccount.userId,
            userProfilePic:
              firestoreAccount.userProfilePic || AdminIcon || FALLBACK_IMAGE,
            screenShots: Array.isArray(firestoreAccount.screenshots)
              ? firestoreAccount.screenshots.map((url, index) => ({
                  id: `screenshot-${index}`,
                  img: url,
                }))
              : [],
            isFromFirestore: true,
            slug: slug,
            currency: firestoreAccount.currency || "USD",
          };
          console.log("Mapped account with views:", foundAccount.views);
          setAccount(foundAccount);
          setOriginalCurrency(foundAccount.currency);
        } else {
          console.log("Account not found, redirecting...");
          toast.error("Account not found.");
          navigate("/categories");
        }
      } catch (error) {
        console.error("Error fetching account:", error);
        toast.error("Failed to load account details.");
        navigate("/categories");
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [slug, navigate, currentUser]);

  // Convert currency when account loads or user currency changes
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

  useEffect(() => {
    const timer = setTimeout(() => setLoadingImages(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isPurchased) {
      setShowCredentials(false);
    }
  }, [isPurchased]);

  // Check for purchased status and cart status whenever account is loaded
  useEffect(() => {
    if (account) {
      const existingCart = safeLocalStorageGet("ghost_cart", []);
      const purchasedAccounts = safeLocalStorageGet("ghost_purchased", []);

      setCart(existingCart);

      // Check if account is already purchased
      const isAlreadyPurchased = purchasedAccounts.some(
        (item) => (item.slug || item.id) === (account.slug || account.id)
      );

      // Check if account is already in cart (pending)
      const isAlreadyPending = existingCart.some(
        (item) => (item.slug || item.id) === (account.slug || account.id)
      );

      setIsPurchased(isAlreadyPurchased);
      setIsPending(isAlreadyPending);

      console.log("Account status:", {
        isAlreadyPurchased,
        isAlreadyPending,
        slug: account.slug || account.id,
      });
    }
  }, [account]);

  const handleImageClick = (index) => setSelectedImage(index);

  const handleNext = () =>
    account?.screenShots?.length > 0 &&
    setSelectedImage((prev) => (prev + 1) % account.screenShots.length);

  const handlePrev = () =>
    account?.screenShots?.length > 0 &&
    setSelectedImage(
      (prev) =>
        (prev - 1 + account.screenShots.length) % account.screenShots.length
    );

  const handleAddToCart = () => {
    if (!currentUser) {
      toast.error("Please log in to add to cart.");
      navigate("/login");
      return;
    }

    const existingCart = safeLocalStorageGet("ghost_cart", []);
    const alreadyInCart = existingCart.some(
      (item) => (item.slug || item.id) === (account.slug || account.id)
    );

    if (alreadyInCart) {
      toast.warning(`${account.title} is already in your cart!`);
    } else {
      // Create a minimal version of the account for storage
      const minimalAccount = {
        id: account.id,
        slug: account.slug,
        title: account.title,
        img: account.img,
        accountWorth: account.accountWorth,
        currency: account.currency,
        userId: account.userId,
        username: account.username,
        createdAt: account.createdAt,
      };

      const updatedCart = [...existingCart, minimalAccount];

      const success = safeLocalStorageSet("ghost_cart", updatedCart);

      if (success) {
        setCart(updatedCart);
        setIsPending(true);
        toast.success(`${account.title} added to cart!`);
        window.dispatchEvent(new Event("storage"));
        console.log("Successfully saved to localStorage:", updatedCart);
      } else {
        toast.error(
          "Unable to add to cart. Storage is full. Please clear some data."
        );
        // Optionally show a modal asking user to clear cart or purchased items
      }
    }
  };

  const handlePurchase = () => {
    if (!currentUser) {
      toast.error("Please log in to purchase.");
      navigate("/login");
      return;
    }

    toast.promise(
      new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            // Add to cart if not already there
            const existingCart = safeLocalStorageGet("ghost_cart", []);
            const alreadyInCart = existingCart.some(
              (item) => (item.slug || item.id) === (account.slug || account.id)
            );

            if (!alreadyInCart) {
              // Create minimal account data
              const minimalAccount = {
                id: account.id,
                slug: account.slug,
                title: account.title,
                img: account.img,
                accountWorth: account.accountWorth,
                currency: account.currency,
                userId: account.userId,
                username: account.username,
                createdAt: account.createdAt,
              };

              const updatedCart = [...existingCart, minimalAccount];
              const success = safeLocalStorageSet("ghost_cart", updatedCart);

              if (!success) {
                reject(new Error("Storage is full"));
                return;
              }

              setCart(updatedCart);
            }

            // Mark as pending (in cart)
            setIsPending(true);

            // Trigger a storage event to notify other components
            window.dispatchEvent(new Event("storage"));

            resolve();
          } catch (error) {
            reject(error);
          }
        }, 2000);
      }),
      {
        loading: `Processing purchase for ${account.title}...`,
        success: `${account.title} added to cart and pending purchase!`,
        error: (err) =>
          `Failed to process ${account.title}: ${
            err.message || "Storage is full"
          }`,
      }
    );
  };

  const toggleCredentialVisibility = () => {
    if (!isPurchased) {
      toast.error("You must purchase this account to view credentials");
    } else if (!currentUser) {
      toast.error("Please log in to view credentials.");
      navigate("/login");
    } else {
      setShowCredentials(!showCredentials);
    }
  };

  const renderCredentials = () => {
    if (!account.accountCredential) return null;

    return (
      <div className="mt-4 relative">
        <h3 className="text-lg font-semibold text-gray-200">
          Account Credentials
        </h3>
        <div className="flex items-center">
          <p
            className={`text-gray-300 ${
              !isPurchased || (isPurchased && !showCredentials)
                ? "blur-sm select-none"
                : ""
            }`}
          >
            {account.accountCredential}
          </p>
          <button
            onClick={toggleCredentialVisibility}
            className="ml-2 p-2 bg-[#161B22] hover:bg-gray-600 rounded-full"
            aria-label={
              showCredentials ? "Hide credentials" : "Show credentials"
            }
            title={showCredentials ? "Hide credentials" : "Show credentials"}
          >
            {showCredentials ? (
              <FaEyeSlash className="text-gray-300" />
            ) : (
              <FaEye className="text-gray-300" />
            )}
          </button>
        </div>
        {isPurchased && !showCredentials && (
          <p className="text-xs text-gray-400 mt-1">
            Click the eye icon to reveal credentials
          </p>
        )}
        {!isPurchased && (
          <p className="text-xs text-yellow-400 mt-1">
            Purchase this account to view credentials
          </p>
        )}
      </div>
    );
  };

  const renderPrice = () => {
    if (!account.accountWorth) return null;

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-[#0576FF]">Account Worth</h3>
        {convertedPrice !== null ? (
          <div>
            <p className="text-xl text-[#0576FF] font-bold">
              {formatCurrency(convertedPrice, userCurrency)}
            </p>
            {originalCurrency !== userCurrency && (
              <p className="text-sm text-gray-400">
                Original:{" "}
                {formatCurrency(account.accountWorth, originalCurrency)}
              </p>
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#010409]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-l-4 border-r-4 border-t-[#0576FF] border-b-[#0576FF] border-l-transparent border-r-transparent"></div>
          <p className="text-white text-lg font-semibold">Loading Account...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#010409] text-white">
        <div className="text-center text-red-500 text-2xl mb-4">
          Account not found
        </div>
        <Link
          to="/categories"
          className="bg-[#0576FF] text-white px-4 py-2 rounded-lg hover:bg-[#0456CC]"
        >
          Return to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010409] text-white">
      <NavBar />
      <div className="p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          {currentUser && (
            <div className="flex justify-start mb-4">
              <BackButton />
            </div>
          )}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <img
                src={account.img}
                alt={account.title}
                className="w-full h-64 sm:h-80 object-cover rounded-lg mb-4"
                onError={(e) => {
                  console.error(
                    `Failed to load main image for ${account.title}`
                  );
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-wide">
                  {account.title}
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Uploaded by: {account.username || "Ghost"}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-gray-400">
                    {account.views || 0} Total Views
                  </p>
                  {currentUser && (
                    <Link to={`/profilevisit/${account.userId}`}>
                      <img
                        src={account.userProfilePic}
                        alt="User Profile"
                        className="w-8 h-8 rounded-full object-cover hover:cursor-pointer"
                        onError={(e) => {
                          console.error(
                            `Failed to load profile pic for ${account.username}`
                          );
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                    </Link>
                  )}
                </div>
              </div>
              {account.screenShots?.length > 0 && (
                <div className="mt-6 bg-[#161B22] border border-gray-800 p-5 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-800">
                    Screenshots
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {loadingImages
                      ? Array.from({ length: account.screenShots.length }).map(
                          (_, index) => (
                            <div
                              key={index}
                              className="relative w-full h-24 bg-[#1C2526] rounded-md flex items-center justify-center"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-l-2 border-r-2 border-t-[#0576FF] border-b-[#0576FF] border-l-transparent border-r-transparent"></div>
                                <p className="text-gray-400 text-xs">
                                  Loading...
                                </p>
                              </div>
                            </div>
                          )
                        )
                      : account.screenShots.map((shot, index) => (
                          <img
                            key={shot.id || `shot-${index}`}
                            src={shot.img}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md cursor-pointer"
                            onClick={() => handleImageClick(index)}
                            onError={(e) => {
                              console.error(
                                `Failed to load screenshot ${index + 1}`
                              );
                              e.target.src = FALLBACK_IMAGE;
                            }}
                          />
                        ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 bg-[#161B22] border border-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold border-b border-gray-800 pb-2 mb-4">
                Details
              </h2>
              <p className="text-gray-300 text-sm sm:text-base">
                {account.details}
              </p>
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
                <Toaster richColors position="top-center" />
                <button
                  onClick={handleAddToCart}
                  disabled={isPending || isPurchased}
                  className={`flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200
                    ${
                      isPending || isPurchased
                        ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                        : "bg-gray-700 text-blue-300 border border-blue-500/30 hover:bg-gray-600 hover:border-blue-400"
                    }`}
                  aria-label={isPending ? "Item in cart" : "Add to cart"}
                >
                  {isPending ? (
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
                  ) : isPurchased ? (
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
                        : isPending
                        ? "bg-yellow-600 text-white hover:bg-yellow-700"
                        : "bg-[#0576FF] text-white hover:bg-[#0465db]"
                    }`}
                  aria-label={
                    isPurchased
                      ? "Purchased"
                      : isPending
                      ? "Pending"
                      : "Purchase account"
                  }
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
                  ) : isPending ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span>Pending</span>
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
              </div>
            </div>
          </div>
          {selectedImage !== null && account.screenShots?.length > 0 && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-5 right-5 text-white text-3xl cursor-pointer"
                aria-label="Close image modal"
              >
                <GiCancel className="w-8 h-8 sm:w-10 sm:h-10" />
              </button>
              <button
                onClick={handlePrev}
                className="absolute left-5 text-white text-3xl cursor-pointer"
                aria-label="Previous image"
              >
                <FaArrowLeft className="w-8 h-8 sm:w-10 sm:h-10" />
              </button>
              <img
                src={account.screenShots[selectedImage].img}
                alt={`Screenshot ${selectedImage + 1}`}
                className="max-w-[90%] max-h-[80vh] rounded-lg"
                onError={(e) => {
                  console.error(
                    `Failed to load modal screenshot ${selectedImage + 1}`
                  );
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
              <button
                onClick={handleNext}
                className="absolute right-5 text-white text-3xl cursor-pointer"
                aria-label="Next image"
              >
                <FaArrowRight className="w-8 h-8 sm:w-10 sm:h-10" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
