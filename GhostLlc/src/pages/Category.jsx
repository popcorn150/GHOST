import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import CategoryFilter from "./CategoryFilter";
import { AdminIcon } from "../utils";
import availableAccounts from "../constants";
import { 
  fetchAccountsMinimal, 
  loadAccountImages
} from "../utils/firebaseUtils";
import { useAuth } from "../components/AuthContext";
import { db } from "../database/firebaseConfig";
import { doc, getDoc, collection, query, onSnapshot } from "firebase/firestore";

const Category = () => {
  const { currentUser: user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [purchasedAccounts, setPurchasedAccounts] = useState([]);
  const [cartAccounts, setCartAccounts] = useState([]);
  const [loadedImages, setLoadedImages] = useState({});
  const carouselRef = useRef(null);
  const observerRef = useRef(null);

  // Load individual account image
  const loadAccountImage = useCallback(async (accountId) => {
    try {
      const imageData = await loadAccountImages([accountId]);
      setLoadedImages(prev => ({
        ...prev,
        [accountId]: imageData[accountId] || { accountImage: AdminIcon, screenshots: [] }
      }));
    } catch (error) {
      console.error(`Error loading image for account ${accountId}:`, error);
      setLoadedImages(prev => ({
        ...prev,
        [accountId]: { accountImage: AdminIcon, screenshots: [] }
      }));
    }
  }, []);

  // Intersection Observer for lazy loading images
  const setupImageLazyLoading = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const accountId = entry.target.dataset.accountId;
            if (accountId && !loadedImages[accountId]) {
              loadAccountImage(accountId);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );
  }, [loadedImages, loadAccountImage]);

  // Fetch purchased and cart accounts from Firestore
  useEffect(() => {
    if (!user) {
      setPurchasedAccounts([]);
      setCartAccounts([]);
      return;
    }

    // Real-time listener for purchased accounts
    const purchasedQuery = query(collection(db, `users/${user.uid}/purchased`));
    const unsubscribePurchased = onSnapshot(
      purchasedQuery,
      (snapshot) => {
        const purchased = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPurchasedAccounts(purchased);
      },
      (error) => {
        console.error("Error fetching purchased accounts:", error);
      }
    );

    // Real-time listener for cart accounts
    const cartQuery = query(collection(db, `users/${user.uid}/cart`));
    const unsubscribeCart = onSnapshot(
      cartQuery,
      (snapshot) => {
        const cart = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCartAccounts(cart);
      },
      (error) => {
        console.error("Error fetching cart accounts:", error);
      }
    );

    return () => {
      unsubscribePurchased();
      unsubscribeCart();
    };
  }, [user]);

  // Helper function to check if an account is purchased, in cart, or sold
  const isAccountPurchasedOrInCart = useCallback((account) => {
    const accountId = account.slug || account.id;
    return (
      purchasedAccounts.some((item) => (item.slug || item.id) === accountId) ||
      cartAccounts.some((item) => (item.slug || item.id) === accountId) ||
      account.sold === true
    );
  }, [purchasedAccounts, cartAccounts]);

  // Fetch user profile image
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists() && userDocSnap.data().profileImage) {
            setProfileImage(userDocSnap.data().profileImage);
          }
        } catch (error) {
          console.error("Error fetching profile image:", error);
        }
      }
    };
    fetchUserData();
  }, [user]);

  // Fast initial load with minimal data
  useEffect(() => {
    const fetchAccountsInitial = async () => {
      setLoading(true);
      try {
        // Use minimal fetch for faster initial load
        const fetchedAccounts = await fetchAccountsMinimal();
        
        if (fetchedAccounts && fetchedAccounts.length > 0) {
          const mappedAccounts = fetchedAccounts.map((account, index) => ({
            id: account.id,
            slug: account.id,
            title: account.accountName || "Untitled",
            accountName: account.accountName || "Untitled",
            username: account.username || "Ghost",
            img: AdminIcon, // Placeholder initially
            accountImage: AdminIcon, // Placeholder initially
            userProfilePic: AdminIcon, // Placeholder initially
            views: account.views || 0,
            currency: account.currency || "USD",
            accountWorth: account.accountWorth || "N/A",
            accountCredential: account.accountCredential || "N/A",
            details: account.accountDescription || "No description",
            accountDescription: account.accountDescription || "No description",
            screenshots: [], // Empty initially
            isFromFirestore: true,
            category: account.category || "Others",
            sold: account.sold || false,
          }));
          setAccounts(mappedAccounts);
          
          // Set up lazy loading after accounts are rendered
          setTimeout(() => {
            setupImageLazyLoading();
          }, 100);
        } else {
          setAccounts([]);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountsInitial();
  }, [user, setupImageLazyLoading]);

  // Set up intersection observer when accounts change
  useEffect(() => {
    if (accounts.length > 0 && !loading) {
      setupImageLazyLoading();
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [accounts, loading, setupImageLazyLoading]);

  // Combine static and Firestore accounts
  const modifiedAvailableAccounts = availableAccounts.map((account) => ({
    ...account,
    isFromFirestore: false,
    sold: false,
  }));

  const combinedAccounts = [...modifiedAvailableAccounts, ...accounts];

  // Filter accounts for the carousel
  const filteredAccounts = combinedAccounts.filter((account) => {
    const title = account.title || account.accountName || "";
    return (
      title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !isAccountPurchasedOrInCart(account)
    );
  });

  const duplicatedAccounts = [...filteredAccounts, ...filteredAccounts];

  return (
    <>
      <style>
        {`
          @keyframes continuousScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .carousel-track {
            display: flex;
            width: fit-content;
            animation: continuousScroll 60s linear infinite;
            gap: 1.5rem;
          }
          .carousel-wrapper::-webkit-scrollbar {
            display: none;
          }
          .loader {
            border: 5px solid #444;
            border-top: 5px solid #6C5DD3;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .image-placeholder {
            background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>

      <NavBar profileImage={profileImage || "/default-profile.png"} />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <input
            type="text"
            placeholder="Search for an account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 mb-8 bg-[#161B22] text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9] shadow-lg"
          />

          <h1 className="text-2xl sm:text-3xl md:text-4xl text-white font-bold mb-8">
            Featured Game Accounts
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loader" />
            </div>
          ) : (
            <div className="overflow-hidden relative carousel-wrapper mb-12">
              <div ref={carouselRef} className="carousel-track gap-6 pb-4">
                {duplicatedAccounts.length > 0 ? (
                  duplicatedAccounts.map((account, index) => {
                    const accountId = account.id || account.slug;
                    const imageData = loadedImages[accountId];
                    const imageSrc = imageData?.accountImage || account.img || AdminIcon;
                    
                    return (
                      <div
                        key={`${accountId}-${index}`}
                        data-account-id={accountId}
                        ref={(el) => {
                          if (el && observerRef.current && account.isFromFirestore) {
                            observerRef.current.observe(el);
                          }
                        }}
                        className="relative w-72 flex-shrink-0 bg-[#1C1F26] rounded-2xl shadow-2xl hover:scale-105 hover:shadow-purple-500/20 transition-all duration-300 ease-in-out cursor-pointer border border-gray-800/50"
                      >
                        <div className="overflow-hidden rounded-t-2xl p-3">
                          {!imageData && account.isFromFirestore ? (
                            <div className="w-full h-44 rounded-xl image-placeholder" />
                          ) : (
                            <img
                              src={imageSrc}
                              alt={account.title || account.accountName || "Untitled"}
                              className="w-full h-44 object-cover rounded-xl transform hover:scale-110 transition duration-500 ease-in-out"
                              loading="lazy"
                            />
                          )}
                        </div>
                        <div className="p-5">
                          <h2 className="text-xl text-white font-bold truncate mb-2">
                            {account.title || account.accountName || "Untitled"}
                          </h2>
                          <p className="text-sm text-gray-400 mb-3">
                            {account.username ? `By ${account.username}` : "By Ghost"}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                              </svg>
                              {account.views || 0} Views
                            </span>
                            <img
                              src={imageData?.userProfilePic || account.userProfilePic || AdminIcon}
                              alt="User"
                              className="w-9 h-9 rounded-full object-cover border-2 border-gray-700"
                              loading="lazy"
                            />
                          </div>
                          {account.isFromFirestore ? (
                            <Link
                              to={`/account/${account.slug || account.id}`}
                              className="inline-block w-full text-center bg-gradient-to-r from-[#4426B9] to-[#6C5DD3] text-white py-3 px-6 rounded-xl font-bold hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-lg"
                            >
                              View Details
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">
                      No featured accounts available.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl text-white font-bold mb-8">
            Browse By Category
          </h1>

          <CategoryFilter
            key={searchTerm.trim() === "" ? "default" : "active"}
            searchTerm={searchTerm}
            combinedAccounts={combinedAccounts}
            loading={loading}
          />
        </div>
      </div>
    </>
  );
};

export default Category;