import "../App.css";
import { useParams, Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import BackButton from "../components/BackButton";
import { AdminIcon } from "../AdminIcon";
import { fetchAccountByIdWithImages } from "../utils/firebaseUtils";
import { useAuth } from "../components/AuthContext";
import { useEffect, useState, useRef } from "react";
import { FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import { Toaster, toast } from "sonner";
import {
  doc,
  getDoc,
  updateDoc,
  writeBatch,
  increment,
  collection,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../database/firebaseConfig";

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
  const [isPurchased, setIsPurchased] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  // Helper function to check if purchase is within an hour of upload
  const isWithinOneHour = (createdAt) => {
    if (!createdAt) return false;
    const uploadTime = createdAt.seconds
      ? createdAt.seconds * 1000
      : new Date(createdAt).getTime();
    const currentTime = new Date().getTime();
    const oneHourInMs = 60 * 60 * 1000;
    return currentTime - uploadTime <= oneHourInMs;
  };

  // Helper function to get today's date as YYYY-MM-DD
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Log imports to debug
  useEffect(() => {
    console.log("AdminIcon imported:", AdminIcon);
    console.log(
      "fetchAccountByIdWithImages imported:",
      fetchAccountByIdWithImages
    );
  }, []);

  const trackAccountView = async (accountId, userId, uploaderId) => {
    if (!currentUser || currentUser.uid === uploaderId) return;

    try {
      const viewerId = currentUser.uid;
      const accountDocRef = doc(db, "accounts", accountId);
      const viewsRef = collection(db, `accounts/${accountId}/views`);
      const viewerDocRef = doc(viewsRef, viewerId);

      // Check if the viewer has already viewed
      const viewerDoc = await getDoc(viewerDocRef);
      if (viewerDoc.exists()) {
        return; // Viewer already recorded, no further action needed
      }

      // Record the new viewer
      await setDoc(viewerDocRef, { viewedAt: new Date() });

      // Count unique viewers
      const viewsSnapshot = await getDocs(viewsRef);
      const uniqueViewers = viewsSnapshot.size;

      // Update views count
      await updateDoc(accountDocRef, {
        views: uniqueViewers,
      });

      // Check "Peacock" achievement (ID 2) for the uploader
      if (uniqueViewers >= 50) {
        const uploaderDocRef = doc(db, "users", uploaderId);
        await updateDoc(uploaderDocRef, {
          [`achievementStatuses.2.progress`]: 100,
          [`achievementStatuses.2.earned`]: true,
        });
      }
    } catch (error) {
      console.error("Error tracking account view:", error);
      toast.error("Failed to track account view: " + error.message);
    }
  };

  useEffect(() => {
    const fetchAccountData = async () => {
      setLoading(true);
      console.log("Fetching account data for slug:", slug);

      try {
        const firestoreAccount = await fetchAccountByIdWithImages(slug);
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
          };
          console.log("Mapped Firestore account:", foundAccount);
          setAccount(foundAccount);

          // Track account view
          if (currentUser) {
            await trackAccountView(
              firestoreAccount.id,
              currentUser.uid,
              firestoreAccount.userId
            );
          }
        } else {
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

  useEffect(() => {
    // Load cart from localStorage on mount
    const existingCart = JSON.parse(localStorage.getItem("ghost_cart")) || [];
    setCart(existingCart);
  }, []);

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

    const alreadyInCart = cart.some(
      (item) => (item.slug || item.id) === (account.slug || account.id)
    );

    if (alreadyInCart) {
      toast.warning(`${account.title} is already in your cart!`);
    } else {
      const updatedCart = [...cart, account];
      localStorage.setItem("ghost_cart", JSON.stringify(updatedCart));
      setCart(updatedCart);
      toast.success(`${account.title} added to cart!`);
      console.log("🧃 Saved to localStorage:", updatedCart);
    }
  };

  const handlePurchase = async () => {
    if (!currentUser) {
      toast.error("Please log in to purchase.");
      navigate("/login");
      return;
    }

    try {
      toast.promise(
        new Promise(async (resolve, reject) => {
          try {
            setIsPurchased(true);

            const buyerDocRef = doc(db, "users", currentUser.uid);
            const sellerDocRef = doc(db, "users", account.userId);
            const batch = writeBatch(db);

            // Get buyer's data
            const buyerDoc = await getDoc(buyerDocRef);
            let dailyPurchases = 0;
            let lastPurchaseDate = "";
            let totalPurchases = 0;

            if (buyerDoc.exists()) {
              const buyerData = buyerDoc.data();
              dailyPurchases = buyerData.dailyPurchases || 0;
              lastPurchaseDate = buyerData.lastPurchaseDate || "";
              totalPurchases = buyerData.totalPurchases || 0;
            }

            // Reset daily purchases if it's a new day
            const today = getTodayDate();
            if (lastPurchaseDate !== today) {
              dailyPurchases = 0;
            }

            // Increment purchase counters
            dailyPurchases += 1;
            totalPurchases += 1;

            // Update "Flex" achievement (ID 1)
            const flexProgress = Math.min((dailyPurchases / 5) * 100, 100);
            batch.update(buyerDocRef, {
              dailyPurchases,
              lastPurchaseDate: today,
              totalPurchases,
              [`achievementStatuses.1.progress`]: flexProgress,
            });

            // Update "Big Spender" achievement (ID 4)
            if (account.accountWorth >= 1000) {
              batch.update(buyerDocRef, {
                [`achievementStatuses.4.progress`]: 100,
                [`achievementStatuses.4.earned`]: true,
              });
            }

            // Update "Hawk Eye" achievement (ID 6)
            if (isWithinOneHour(account.createdAt)) {
              batch.update(buyerDocRef, {
                [`achievementStatuses.6.progress`]: 100,
                [`achievementStatuses.6.earned`]: true,
              });
            }

            // Update "Splendid Taste" achievement (ID 8)
            if (account.views >= 50) {
              batch.update(buyerDocRef, {
                [`achievementStatuses.8.progress`]: 100,
                [`achievementStatuses.8.earned`]: true,
              });
            }

            // Update "Hustler" achievement (ID 7) for the seller
            if (account.userId) {
              const sellerDoc = await getDoc(sellerDocRef);
              let totalAccountsSold = 0;
              if (sellerDoc.exists()) {
                totalAccountsSold = sellerDoc.data().totalAccountsSold || 0;
              }
              totalAccountsSold += 1;
              const hustlerProgress = Math.min(
                (totalAccountsSold / 10) * 100,
                100
              ); // Assuming 10 sales for completion
              batch.update(sellerDocRef, {
                totalAccountsSold,
                [`achievementStatuses.7.progress`]: hustlerProgress,
              });
            }

            // Commit batch
            await batch.commit();
            resolve();
          } catch (error) {
            reject(error);
          }
        }),
        {
          loading: `Processing purchase for ${account.title}...`,
          success: `${account.title} purchased successfully!`,
          error: `Failed to purchase ${account.title}`,
        }
      );
    } catch (error) {
      console.error("Purchase error:", error);
      setIsPurchased(false);
    }
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

  const isInCart = cart.some(
    (item) => (item.slug || item.id) === (account.slug || account.id)
  );

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
              {account.accountWorth && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-[#0576FF]">
                    Account Worth
                  </h3>
                  <p className="text-xl text-[#0576FF]">
                    ${account.accountWorth}
                  </p>
                </div>
              )}
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

              {currentUser && (
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                  <Toaster richColors position="top-center" />

                  <button
                    onClick={handleAddToCart}
                    disabled={isInCart}
                    className={`flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200
                      ${
                        isInCart
                          ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                          : "bg-gray-700 text-blue-300 border border-blue-500/30 hover:bg-gray-600 hover:border-blue-400"
                      }
                    `}
                    aria-label={isInCart ? "Item in cart" : "Add to cart"}
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
                      }
                    `}
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
                </div>
              )}
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
