import "../App.css";
import { useParams, Link, useNavigate, Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import BackButton from "../components/BackButton";
import { AdminIcon } from "../AdminIcon";
import { fetchAccountByIdWithImages } from "../utils/firebaseUtils";
import { useAuth } from "../components/AuthContext";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import { toast } from "sonner";
import { db } from "../database/firebaseConfig";
import { EscrowService } from "../services/Escrow.service";

// Fallback image URL if AdminIcon is undefined
const FALLBACK_IMAGE = "https://via.placeholder.com/150?text=Placeholder";

const AccountDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loadingImages, setLoadingImages] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isPurchased] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [currency] = useState("NGN");

  useEffect(() => {
    console.log("Current user:", currentUser);
  }, [currentUser]);

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
            slug: slug, // Ensure slug is included
          };
          console.log("Mapped account with views:", foundAccount.views);
          setAccount(foundAccount);
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
      const existingCart = JSON.parse(localStorage.getItem("ghost_cart")) || [];
      const purchasedAccounts =
        JSON.parse(localStorage.getItem("ghost_purchased")) || [];

      setCart(existingCart);

      // Check if account is already purchased
      const isAlreadyPurchased = purchasedAccounts.some(
        (item) => (item.slug || item.id) === (account.slug || account.id)
      );

      // Check if account is already in cart (pending)
      const isAlreadyPending = existingCart.some(
        (item) => (item.slug || item.id) === (account.slug || account.id)
      );

      // setIsPurchased(isAlreadyPurchased);
      // setIsPending(isAlreadyPending);

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

    const existingCart = JSON.parse(localStorage.getItem("ghost_cart")) || [];
    const alreadyInCart = existingCart.some(
      (item) => (item.slug || item.id) === (account.slug || account.id)
    );

    if (alreadyInCart) {
      toast.warning(`${account.title} is already in your cart!`);
    } else {
      const updatedCart = [...existingCart, account];
      localStorage.setItem("ghost_cart", JSON.stringify(updatedCart));
      setCart(updatedCart);
      // setIsPending(true); // Mark as pending when added to cart
      toast.success(`${account.title} added to cart!`);

      // Trigger a storage event to notify other components
      window.dispatchEvent(new Event("storage"));

      console.log("Saved to localStorage:", updatedCart);
    }
  };

  const handlePurchase = () => {
    if (!currentUser) {
      toast.error("Please log in to purchase.");
      navigate("/login");
      return;
    }

    const service = new EscrowService(db, 12);
    service.checkout(
      {
        buyerId: currentUser.uid,
        sellerId: account.userId,
        accountId: account.id,
        itemDescription: account.title,
        accountCredential: account.accountCredential,
        amount: Number(account.accountWorth),
        currency,
        email: currentUser.email,
      },
      {
        onSuccess: (reference) => {
          /* UI update */
          navigate("/account/" + slug + "/linked-accounts/" + reference);
        },
        onClose: () => {
          /* popup closed */
        },
        onError: (err) => {
          console.log("Error Occured during payment");
          console.log({ err });

          /* handle error */
        },
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

              {/* Outlet for dynamic content */}
              <Outlet
                context={{
                  account,
                  isPurchased,
                  showCredentials,
                  toggleCredentialVisibility,
                  renderCredentials,
                  handleAddToCart,
                  handlePurchase,
                  // isInCart,
                  currentUser,
                }}
              />
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
