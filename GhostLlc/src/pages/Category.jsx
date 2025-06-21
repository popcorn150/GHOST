import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import CategoryFilter from "./CategoryFilter";
import { AdminIcon } from "../utils";
import availableAccounts from "../constants";
import { 
  fetchAccountsWithImages,
  fetchUserProfileOptimized
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
  const [purchasedAccounts, setPurchasedAccounts] = useState([]);
  const [cartAccounts, setCartAccounts] = useState([]);
  const carouselRef = useRef(null);

  // Fetch purchased and cart accounts from Firestore
  useEffect(() => {
    if (!user) {
      setPurchasedAccounts([]);
      setCartAccounts([]);
      return;
    }

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

  const isAccountPurchasedOrInCart = (account) => {
    const accountId = account.slug || account.id;
    return (
      purchasedAccounts.some((item) => (item.slug || item.id) === accountId) ||
      cartAccounts.some((item) => (item.slug || item.id) === accountId) ||
      account.sold === true
    );
  };

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

  useEffect(() => {
    const fetchAccountsInitial = async () => {
      setLoading(true);
      try {
        console.log("Fetching accounts with images...");
        const fetchedAccounts = await fetchAccountsWithImages();
        
        if (fetchedAccounts && fetchedAccounts.length > 0) {
          console.log("Fetched accounts:", fetchedAccounts);
          
          const mappedAccounts = await Promise.all(
            fetchedAccounts.map(async (account, index) => {
              let userProfilePic = account.userProfilePic;
              if (!userProfilePic && (account.userId || account.username)) {
                userProfilePic = await fetchUserProfileOptimized(account.userId, account.username);
              }

              return {
                id: account.id,
                slug: account.id,
                title: account.accountName || "Untitled",
                accountName: account.accountName || "Untitled",
                username: account.username || "Ghost",
                img: account.accountImage || AdminIcon,
                accountImage: account.accountImage || AdminIcon,
                userProfilePic: userProfilePic || AdminIcon,
                views: account.views || 0,
                currency: account.currency || "USD",
                accountWorth: account.accountWorth || "N/A",
                accountCredential: account.accountCredential || "N/A",
                details: account.accountDescription || "No description",
                accountDescription: account.accountDescription || "No description",
                screenshots: account.screenshots || [],
                isFromFirestore: true,
                category: account.category || "Others",
                sold: account.sold || false,
                images: {
                  accountImage: account.accountImage || AdminIcon
                }
              };
            })
          );
          
          console.log("Mapped accounts with images:", mappedAccounts);
          setAccounts(mappedAccounts);
        } else {
          console.log("No accounts found");
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
  }, [user]);

  const modifiedAvailableAccounts = availableAccounts.map((account) => ({
    ...account,
    isFromFirestore: false,
    sold: false,
  }));

  const combinedAccounts = [...modifiedAvailableAccounts, ...accounts];

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
          .image-error {
            background: #2a2a2a;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 12px;
          }
        `}
      </style>

      <NavBar profileImage={profileImage || "/default-profile.png"} />

      <div className="px-3 py-5"> {/* Further reduced from px-4 (16px) to px-3 (12px) */}
        <input
          type="text"
          placeholder="Search for an account..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 mb-6 bg-[#161B22] text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
        />

        <h1 className="text-xl sm:text-2xl md:text-3xl text-white font-bold mb-6 whitespace-nowrap">
          Featured Game Accounts
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="loader" />
          </div>
        ) : (
          <div className="overflow-hidden relative carousel-wrapper">
            <div ref={carouselRef} className="carousel-track space-x-3 pr-3"> {/* Further reduced from space-x-4 pr-4 to space-x-3 pr-3 */}
              {duplicatedAccounts.length > 0 ? (
                duplicatedAccounts.map((account, index) => {
                  const accountId = account.id || account.slug;
                  const imageSrc = account.img || account.accountImage || AdminIcon;
                  const profilePic = account.userProfilePic || AdminIcon;
                  
                  return (
                    <div
                      key={`${accountId}-${index}`}
                      className="relative w-64 flex-shrink-0 bg-[#1C1F26] rounded-xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer"
                    >
                      <div className="overflow-hidden rounded-t-xl p-2">
                        <img
                          src={imageSrc}
                          alt={account.title || account.accountName || "Untitled"}
                          className="w-full h-40 object-cover rounded-md transform hover:scale-110 transition duration-500 ease-in-out"
                          loading="lazy"
                          onError={(e) => {
                            console.error(`Failed to load image for ${account.title}:`, e.target.src);
                            e.target.src = AdminIcon;
                          }}
                          onLoad={() => {
                            console.log(`Successfully loaded image for ${account.title}:`, imageSrc);
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h2 className="text-lg text-white font-semibold truncate">
                          {account.title || account.accountName || "Untitled"}
                        </h2>
                        <p className="text-sm text-gray-400 mb-2">
                          {account.username ? `By ${account.username}` : "By Ghost"}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                          <span>{account.views || 0} Views</span>
                          <img
                            src={profilePic}
                            alt="User"
                            className="w-8 h-8 rounded-full object-cover border border-gray-700"
                            loading="lazy"
                            onError={(e) => {
                              console.error(`Failed to load profile pic for ${account.username}:`, e.target.src);
                              e.target.src = AdminIcon;
                            }}
                          />
                        </div>
                        {account.isFromFirestore ? (
                          <Link
                            to={`/account/${account.slug || account.id}`}
                            className="inline-block w-full text-center bg-gradient-to-r from-[#4426B9] to-[#6C5DD3] text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition"
                          >
                            View Details
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-white text-center">
                  No featured accounts available.
                </p>
              )}
            </div>
          </div>
        )}

        <h1 className="text-xl sm:text-2xl md:text-3xl text-white font-bold my-6 whitespace-nowrap">
          Browse By Category
        </h1>

        <CategoryFilter
          key={searchTerm.trim() === "" ? "default" : "active"}
          searchTerm={searchTerm}
          combinedAccounts={combinedAccounts}
          loading={loading}
        />
      </div>
    </>
  );
};

export default Category;