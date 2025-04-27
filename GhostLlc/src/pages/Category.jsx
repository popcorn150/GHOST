import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import CategoryFilter from "./CategoryFilter";
import { AdminIcon } from "../utils";
import availableAccounts from "../constants";
import { fetchAccountsWithImages } from "../utils/firebaseUtils";
import { useAuth } from "../components/AuthContext";
import { db } from "../database/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

const Category = () => {
  const { currentUser: user, loading: authLoading } = useAuth() || {
    currentUser: null,
    loading: true,
  };
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);
  const isMounted = useRef(false);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader" />
      </div>
    );
  }

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
    isMounted.current = true;

    const fetchUploadedAccounts = async () => {
      setLoading(true);
      if (!user) {
        setAccounts([]);
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching accounts...");
        const fetchedAccounts = await fetchAccountsWithImages();
        console.log("Fetched accounts:", fetchedAccounts);

        if (fetchedAccounts && fetchedAccounts.length > 0) {
          const mappedAccounts = fetchedAccounts.map((account, index) => ({
            id: account.id,
            slug: account.id,
            title: account.accountName || "Untitled",
            accountName: account.accountName || "Untitled",
            username: account.username || "Ghost",
            img: account.accountImage || AdminIcon,
            accountImage: account.accountImage || AdminIcon,
            userProfilePic: account.userProfilePic || AdminIcon,
            views: account.views || 0,
            currency: account.currency || "USD",
            accountWorth: account.accountWorth || "N/A",
            accountCredential: account.accountCredential || "N/A",
            details: account.accountDescription || "No description",
            accountDescription: account.accountDescription || "No description",
            screenshots: (account.screenshots || []).map((img, idx) => ({
              id: `screenshot-${index}-${idx}`,
              img: img || AdminIcon,
            })),
            isFromFirestore: true,
            category: account.category || "Other",
            userId: account.userId,
          }));

          if (isMounted.current) {
            setAccounts(mappedAccounts);
          }
        } else {
          if (isMounted.current) {
            setAccounts([]);
          }
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        if (isMounted.current) {
          setAccounts([]);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchUploadedAccounts();

    return () => {
      isMounted.current = false;
    };
  }, [user]);

  const trackAccountView = async (accountId, uploaderId) => {
    if (!user || user.uid === uploaderId) return;

    try {
      const viewerId = user.uid;
      const viewerDocRef = doc(db, `accounts/${accountId}/views`, viewerId);

      const viewerDoc = await getDoc(viewerDocRef);
      if (viewerDoc.exists()) {
        return;
      }

      await setDoc(viewerDocRef, { viewedAt: new Date() });

      const functions = getFunctions();
      const trackView = httpsCallable(functions, "trackAccountView");
      const result = await trackView({ accountId, viewerId, uploaderId });
      console.log("View tracked:", result.data);
    } catch (error) {
      console.warn("Error tracking account view:", error);
    }
  };

  const modifiedAvailableAccounts = availableAccounts.map((account) => ({
    ...account,
    isFromFirestore: false,
  }));

  const combinedAccounts = [...modifiedAvailableAccounts, ...accounts];
  const filteredAccounts = combinedAccounts.filter((account) => {
    const title = account.title || account.accountName || "";
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const duplicatedAccounts = [...filteredAccounts, ...filteredAccounts];

  return (
    <>
      <style>{/* Existing styles unchanged */}</style>

      <NavBar profileImage={profileImage || "/default-profile.png"} />

      <div className="p-5">
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
            <div ref={carouselRef} className="carousel-track space-x-6 pr-6">
              {duplicatedAccounts.map((account, index) => {
                const imageSrc =
                  account.img || account.accountImage || AdminIcon;
                return (
                  <div
                    key={`${account.id || account.slug}-${index}`}
                    className="relative w-64 flex-shrink-0 bg-[#1C1F26] rounded-xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer"
                  >
                    <div className="overflow-hidden rounded-t-xl p-2">
                      <img
                        src={imageSrc}
                        alt={account.title || account.accountName || "Untitled"}
                        className="w-full h-40 object-cover rounded-md transform hover:scale-110 transition duration-500 ease-in-out"
                      />
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg text-white font-semibold truncate">
                        {account.title || account.accountName || "Untitled"}
                      </h2>
                      <p className="text-sm text-gray-400 mb-2">
                        {account.username
                          ? `By ${account.username}`
                          : "By Ghost"}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                        <span>{account.views || 0} Views</span>
                        <img
                          src={account.userProfilePic || AdminIcon}
                          alt="User"
                          className="w-8 h-8 rounded-full object-cover border border-gray-700"
                        />
                      </div>
                      {account.isFromFirestore ? (
                        <Link
                          to={`/account/${account.slug || account.id}`}
                          onClick={() =>
                            trackAccountView(account.id, account.userId)
                          }
                          className="inline-block w-full text-center bg-gradient-to-r from-[#4426B9] to-[#6C5DD3] text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                          View Details
                        </Link>
                      ) : null}
                    </div>
                  </div>
                );
              })}
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
