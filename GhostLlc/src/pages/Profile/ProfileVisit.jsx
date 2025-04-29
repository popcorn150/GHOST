import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import BackButton from "../../components/BackButton";
import {
  BellAlertIcon,
  BellSlashIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
} from "@heroicons/react/24/outline";
import { UploadCloud, User, Heart, Trophy } from "lucide-react";
import { Toaster, toast } from "sonner";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../database/firebaseConfig";
import About from "../Profile/About";
import Favorites from "../Profile/Favourites";
import {
  FaImage,
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaFacebook,
  FaCheckCircle,
} from "react-icons/fa";

// Tabs array matching UserProfile
const tabs = [
  { name: "Uploads", icon: UploadCloud },
  { name: "About", icon: User },
  { name: "Wishlisted", icon: Heart },
  { name: "Achievements", icon: Trophy },
];

const Uploads = ({ profileImage, userId }) => {
  const [uploadedAccounts, setUploadedAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!userId) {
        console.error("No userId provided to Uploads component");
        toast.error("Invalid user ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const q = query(
          collection(db, "accounts"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);

        const accounts = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const accountData = { id: docSnap.id, ...docSnap.data() };
            const imagesRef = collection(db, `accounts/${docSnap.id}/images`);
            const imagesSnap = await getDocs(imagesRef);
            const images = {};
            imagesSnap.forEach((imgDoc) => {
              images[imgDoc.id] = imgDoc.data().image || null;
            });
            return { ...accountData, images };
          })
        );
        setUploadedAccounts(accounts);
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setError("Failed to load accounts. Please try again.");
        toast.error(`Failed to load accounts: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, [userId]);

  const formatNumberWithCommas = (value) => {
    if (!value) return "";
    const cleanedValue = value.toString().replace(/[^0-9.]/g, "");
    const parts = cleanedValue.split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const decimalPart = parts.length > 1 ? `.${parts[1]}` : "";
    return integerPart + decimalPart;
  };

  if (isLoading) {
    return (
      <div className="mt-16 mb-20 flex justify-center items-center h-60">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-l-4 border-r-4 border-t-[#0576FF] border-b-[#0576FF] border-l-transparent border-r-transparent"></div>
          <p className="text-gray-400 text-sm font-light tracking-wider">
            Loading accounts...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-16 mb-20 p-6 bg-gradient-to-br from-[#0E1115] to-[#1A1F29] rounded-2xl border border-gray-800 text-center">
        <p className="text-gray-400 text-base font-light tracking-wider">
          {error}
        </p>
        <button
          onClick={() => fetchAccounts()}
          className="mt-4 px-4 py-2 bg-[#0576FF] text-white rounded-md hover:bg-[#0465D9] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-16 mb-20 p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 xl:p-10 bg-gradient-to-br from-[#0E1115] via-[#1A1F29] to-[#252A36] rounded-2xl border border-gray-800">
      <h2 className="text-gray-100 text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl font-semibold tracking-wider mb-7">
        Accounts Uploaded
      </h2>
      {uploadedAccounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 lg:gap-8">
          {uploadedAccounts.map((acc) => (
            <div
              key={acc.id}
              className="relative bg-[#161B22]/80 p-4 rounded-xl shadow-lg border border-gray-800 transition-all duration-300 group cursor-pointer"
              onClick={() => navigate("/categories")}
            >
              <div className="flex items-center mb-4">
                <img
                  src={profileImage || "/default-profile.png"}
                  alt="User Profile"
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border-2 border-[#0576FF]/60 mr-3 object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-gray-100 text-sm sm:text-base md:text-lg font-medium tracking-wider truncate">
                    {acc.accountName}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm tracking-wider leading-relaxed">
                    <span className="text-[#0576FF] font-light uppercase">
                      Uploaded by:
                    </span>{" "}
                    {acc.username || "Unknown"}
                  </p>
                </div>
              </div>

              {acc.images?.accountImage ? (
                <div className="relative overflow-hidden rounded-lg mb-4 group/image">
                  <img
                    src={acc.images.accountImage}
                    alt={acc.accountName}
                    className="w-full h-36 sm:h-40 md:h-44 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover/image:scale-105"
                    style={{ aspectRatio: "16/9" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>
                </div>
              ) : (
                <div className="w-full h-36 sm:h-40 md:h-44 bg-gradient-to-br from-[#1A1F29] to-[#252A36] flex items-center justify-center rounded-lg shadow-md mb-4">
                  <FaImage className="text-gray-500 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  <p className="text-gray-500 text-xs sm:text-sm font-light tracking-wider ml-2">
                    No Image
                  </p>
                </div>
              )}

              <div className="space-y-2 mb-4">
                <p className="text-gray-200 text-xs sm:text-sm tracking-wider leading-relaxed">
                  <span className="text-[#0576FF] font-bold text-xs">
                    Credential:
                  </span>{" "}
                  <span className="font-normal text-xs blur-sm">
                    {acc.accountCredential || "N/A"}
                  </span>
                </p>
                <p className="text-gray-200 text-xs sm:text-sm tracking-wider leading-relaxed">
                  <span className="text-[#0576FF] font-bold text-xs">
                    Worth:
                  </span>{" "}
                  <span className="font-medium">
                    {acc.accountWorth
                      ? `${formatNumberWithCommas(acc.accountWorth)} (${
                          acc.currency || "USD"
                        })`
                      : "N/A"}
                  </span>
                </p>
                <p className="text-gray-200 text-xs sm:text-sm tracking-wider leading-relaxed line-clamp-2">
                  <span className="text-[#0576FF] font-bold text-xs">
                    Description:
                  </span>{" "}
                  <span className="font-normal text-xs">
                    {acc.accountDescription || "No description provided."}
                  </span>
                </p>
              </div>

              {acc.images &&
              Object.keys(acc.images).filter((key) =>
                key.startsWith("screenshot")
              ).length > 0 ? (
                <div className="mb-2">
                  <p className="text-gray-200 text-xs sm:text-sm font-bold tracking-wider mb-2">
                    Screenshots:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(acc.images)
                      .filter((key) => key.startsWith("screenshot"))
                      .map((key, index) =>
                        acc.images[key] ? (
                          <div
                            key={index}
                            className="relative group/screenshot"
                          >
                            <img
                              src={acc.images[key]}
                              alt={`Screenshot ${index + 1}`}
                              className="w-full h-16 sm:h-18 md:h-20 object-cover rounded-md shadow-sm transition-transform duration-300 group-hover/screenshot:scale-105"
                              style={{ aspectRatio: "4/3" }}
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/screenshot:opacity-100 transition-opacity duration-300 rounded-md"></div>
                          </div>
                        ) : (
                          <div
                            key={index}
                            className="w-full h-16 sm:h-18 md:h-20 bg-gradient-to-br from-[#1A1F29] to-[#252A36] flex items-center justify-center rounded-md shadow-sm"
                          >
                            <FaImage className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                          </div>
                        )
                      )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-xs sm:text-sm font-light tracking-wider mb-2">
                  No screenshots available.
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-400 text-sm sm:text-base font-light tracking-wider">
            No accounts uploaded yet.
          </p>
        </div>
      )}
    </div>
  );
};

const Achievements = ({ userId }) => {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!userId) {
        console.error("No userId provided to Achievements component");
        toast.error("Invalid user ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const achievementStatuses = userData.achievementStatuses || {};

          // Define achievements consistent with UserProfile
          const achievementList = [
            {
              id: 3,
              name: "Entrepreneur",
              description: "Upload 10 accounts to earn this achievement.",
              progress: achievementStatuses[3]?.progress || 0,
              earned: achievementStatuses[3]?.earned || false,
            },
            {
              id: 5,
              name: "Alfred",
              description:
                "Complete your profile (username, image, bio, socials).",
              progress: achievementStatuses[5]?.progress || 0,
              earned: achievementStatuses[5]?.earned || false,
            },
            {
              id: 6,
              name: "Peacock",
              description: "Get 10 unique visitors to your profile.",
              progress: achievementStatuses[6]?.progress || 0,
              earned: achievementStatuses[6]?.earned || false,
            },
          ];

          setAchievements(achievementList);
        } else {
          console.error("User document does not exist for userId:", userId);
          setError("User not found.");
          toast.error("User not found.");
        }
      } catch (err) {
        console.error("Error fetching achievements:", err);
        setError("Failed to load achievements. Please try again.");
        toast.error(`Failed to load achievements: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="mt-16 mb-20 flex justify-center items-center h-60">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-l-4 border-r-4 border-t-[#0576FF] border-b-[#0576FF] border-l-transparent border-r-transparent"></div>
          <p className="text-gray-400 text-sm font-light tracking-wider">
            Loading achievements...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-16 mb-20 p-6 bg-gradient-to-br from-[#0E1115] to-[#1A1F29] rounded-2xl border border-gray-800 text-center">
        <p className="text-gray-400 text-base font-light tracking-wider">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-16 mb-20 p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 xl:p-10 bg-gradient-to-br from-[#0E1115] via-[#1A1F29] to-[#252A36] rounded-2xl border border-gray-800">
      <h2 className="text-gray-100 text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl font-semibold tracking-wider mb-10 sm:mb-12 lg:mb-14">
        Achievements
      </h2>
      {achievements.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-[#161B22]/80 p-4 rounded-xl shadow-lg border ${
                achievement.earned ? "border-green-500" : "border-gray-800"
              }`}
            >
              <div className="flex items-center mb-4">
                <Trophy
                  className={`w-8 h-8 ${
                    achievement.earned ? "text-yellow-400" : "text-gray-400"
                  } mr-3`}
                />
                <div>
                  <h3 className="text-gray-100 text-lg font-medium tracking-wider">
                    {achievement.name}
                  </h3>
                  <p className="text-gray-400 text-sm tracking-wider">
                    {achievement.description}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-[#0576FF] h-2.5 rounded-full"
                  style={{ width: `${achievement.progress}%` }}
                ></div>
              </div>
              <p className="text-gray-300 text-sm mt-2">
                Progress: {achievement.progress}%
              </p>
              {achievement.earned && (
                <p className="text-green-500 text-sm mt-1 flex items-center gap-2">
                  <FaCheckCircle /> Achieved!
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-400 text-sm sm:text-base font-light tracking-wider">
            No achievements earned yet.
          </p>
        </div>
      )}
    </div>
  );
};

const ProfileVisit = () => {
  const { userId } = useParams();
  const [notificationOn, setNotificationOn] = useState(false);
  const [inFavorites, setInFavorites] = useState(false);
  const [activeTab, setActiveTab] = useState("Uploads");
  const [profileData, setProfileData] = useState({
    username: "UnnamedUser",
    profileImage: null,
    bio: "",
    socials: {
      youtube: "",
      instagram: "",
      tiktok: "",
      twitter: "",
      facebook: "",
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserProfileImage, setCurrentUserProfileImage] = useState(null);
  const navigate = useNavigate();

  const checkProfileCompletion = async (userData, userDocRef) => {
    try {
      const hasUsername =
        userData.username && userData.username !== "UnnamedUser";
      const hasProfileImage = !!userData.profileImage;
      const hasBio = !!userData.bio && userData.bio.trim() !== "";
      const hasSocials = Object.values(userData.socials || {}).some(
        (val) => val && val.trim() !== ""
      );
      const completedFields = [
        hasUsername,
        hasProfileImage,
        hasBio,
        hasSocials,
      ].filter(Boolean).length;
      const progress = (completedFields / 4) * 100;
      const isProfileComplete = completedFields === 4;

      // Update "Alfred" achievement (ID 5) in Firestore
      await updateDoc(userDocRef, {
        [`achievementStatuses.5.progress`]: progress,
        [`achievementStatuses.5.earned`]: isProfileComplete,
      });
    } catch (error) {
      console.error("Error checking profile completion:", error);
      toast.error("Failed to update profile completion: " + error.message);
    }
  };

  useEffect(() => {
    const fetchCurrentUserProfileImage = async () => {
      if (auth.currentUser) {
        try {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists() && userDocSnap.data().profileImage) {
            setCurrentUserProfileImage(userDocSnap.data().profileImage);
          }
        } catch (error) {
          console.error("Error fetching current user profile image:", error);
        }
      }
    };

    fetchCurrentUserProfileImage();
  }, []);

  const trackProfileVisit = async () => {
    if (!auth.currentUser || auth.currentUser.uid === userId) return;

    try {
      const visitorId = auth.currentUser.uid;
      const visitedUserDocRef = doc(db, "users", userId);
      const visitorsRef = collection(db, `users/${userId}/visitors`);
      const visitorDocRef = doc(visitorsRef, visitorId);

      // Check if the visitor has already visited
      const visitorDoc = await getDoc(visitorDocRef);
      if (visitorDoc.exists()) {
        return; // Visitor already recorded, no further action needed
      }

      // Record the new visitor
      await setDoc(visitorDocRef, { visitedAt: new Date() }, { merge: true });

      // Count unique visitors
      const visitorsSnapshot = await getDocs(visitorsRef);
      const uniqueVisitors = visitorsSnapshot.size;
      const progress = Math.min((uniqueVisitors / 10) * 100, 100);

      // Update Peacock achievement
      await updateDoc(visitedUserDocRef, {
        [`achievementStatuses.6.progress`]: progress,
        [`achievementStatuses.6.earned`]: progress >= 100,
      });
    } catch (error) {
      console.error("Error tracking profile visit:", error);
      toast.error("Failed to track profile visit: " + error.message);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (!userId) {
          console.error("No userId provided to ProfileVisit");
          toast.error("User ID is missing");
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          const updatedProfileData = {
            username: data.username || "UnnamedUser",
            profileImage: data.profileImage || null,
            bio: data.bio || "No bio available.",
            socials: data.socials || {
              youtube: "",
              instagram: "",
              tiktok: "",
              twitter: "",
              facebook: "",
            },
          };
          setProfileData(updatedProfileData);

          // Check profile completion for Alfred achievement
          await checkProfileCompletion(updatedProfileData, userDocRef);

          if (auth.currentUser) {
            const currentUserDocRef = doc(db, "users", auth.currentUser.uid);
            const currentUserDocSnap = await getDoc(currentUserDocRef);
            if (currentUserDocSnap.exists()) {
              const favorites = currentUserDocSnap.data().favorites || [];
              setInFavorites(favorites.includes(userId));
            }
          }

          await trackProfileVisit();
        } else {
          console.error("User document does not exist for userId:", userId);
          toast.error("User not found.");
          navigate("/categories");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error(`Failed to load profile: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, navigate]);

  const handleNotificationToggle = async () => {
    if (!auth.currentUser) {
      toast.error("Please log in to manage notifications.");
      return;
    }

    const turningOn = !notificationOn;

    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const notifications = turningOn
        ? arrayUnion(userId)
        : arrayRemove(userId);
      await updateDoc(userDocRef, { notifications });
      setNotificationOn(turningOn);
      toast.success(
        turningOn ? "Notifications turned on!" : "Notifications turned off!"
      );
    } catch (error) {
      console.error("Error toggling notifications:", error);
      toast.error("Failed to toggle notifications.");
    }
  };

  const handleFavorites = async () => {
    if (!auth.currentUser) {
      toast.error("Please log in to manage favorites.");
      return;
    }

    const addingToFavorites = !inFavorites;

    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      if (addingToFavorites) {
        await updateDoc(userDocRef, {
          favorites: arrayUnion(userId),
        });
      } else {
        await updateDoc(userDocRef, {
          favorites: arrayRemove(userId),
        });
      }
      setInFavorites(addingToFavorites);
      toast.success(
        addingToFavorites ? "Added to favorites!" : "Removed from favorites!"
      );
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Failed to update favorites.");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Uploads":
        return (
          <Uploads profileImage={profileData.profileImage} userId={userId} />
        );
      case "About":
        return <About bio={profileData.bio} readOnly={true} />;
      case "Wishlisted":
        return <Favorites userId={userId} />;
      case "Achievements":
        return <Achievements userId={userId} />;
      default:
        return (
          <Uploads profileImage={profileData.profileImage} userId={userId} />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#010409]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-l-4 border-r-4 border-t-[#0576FF] border-b-[#0576FF] border-l-transparent border-r-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <NavBar
        profileImage={currentUserProfileImage || "/default-profile.png"}
      />
      <Toaster richColors position="top-center" closeIcon={false} />
      <div className="flex flex-col items-center p-3 bg-[#010409] min-h-screen">
        <div className="w-full flex justify-start">
          <BackButton />
        </div>

        <div className="mt-6 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-[#0576FF]">
          {profileData.profileImage ? (
            <img
              src={profileData.profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400 text-4xl">?</span>
            </div>
          )}
        </div>

        <h2 className="text-white text-xl font-semibold mt-6">
          {profileData.username}
        </h2>

        {/* Social media links under profile picture */}
        <div className="flex justify-center space-x-4 mt-4">
          {profileData.socials.youtube && (
            <a
              href={`https://youtube.com/@${profileData.socials.youtube}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <FaYoutube size={20} />
            </a>
          )}
          {profileData.socials.instagram && (
            <a
              href={`https://instagram.com/${profileData.socials.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pink-500 transition-colors"
            >
              <FaInstagram size={20} />
            </a>
          )}
          {profileData.socials.tiktok && (
            <a
              href={`https://tiktok.com/@${profileData.socials.tiktok}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTiktok size={20} />
            </a>
          )}
          {profileData.socials.twitter && (
            <a
              href={`https://twitter.com/${profileData.socials.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <FaTwitter size={20} />
            </a>
          )}
          {profileData.socials.facebook && (
            <a
              href={`https://facebook.com/${profileData.socials.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition-colors"
            >
              <FaFacebook size={20} />
            </a>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6">
          <button
            onClick={handleFavorites}
            className={`flex items-center justify-center gap-2 px-4 py-2 border border-purple-500 text-purple-500 rounded-md transition-all text-sm w-fit hover:bg-purple-500/10 ${
              inFavorites ? "bg-purple-500/20" : "bg-transparent"
            }`}
          >
            {inFavorites ? (
              <>
                <BookmarkSlashIcon className="h-5 w-5 self-center" />
                <span>Remove from Favorites</span>
              </>
            ) : (
              <>
                <BookmarkIcon className="h-5 w-5 self-center" />
                <span>Add to Favorites</span>
              </>
            )}
          </button>

          <button
            onClick={handleNotificationToggle}
            className={`flex items-center justify-center gap-2 px-4 py-2 border border-cyan-500 text-cyan-500 rounded-md transition-all text-sm w-fit hover:bg-cyan-500/10 ${
              notificationOn ? "bg-cyan-500/20" : "bg-transparent"
            }`}
          >
            {notificationOn ? (
              <>
                <BellSlashIcon className="h-5 w-5 self-center" />
                <span>Turn off Notifications</span>
              </>
            ) : (
              <>
                <BellAlertIcon className="h-5 w-5 self-center" />
                <span>Turn on Notifications</span>
              </>
            )}
          </button>
        </div>

        <div className="w-full px-4 sm:px-12 md:px-24 mx-auto mt-8">
          <div className="flex justify-between border-b relative">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`py-2 flex-1 flex items-center justify-center cursor-pointer ${
                    activeTab === tab.name
                      ? "text-white font-semibold"
                      : "text-gray-400"
                  }`}
                  aria-current={activeTab === tab.name ? "true" : "false"}
                  aria-label={tab.name}
                  title={tab.name}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="ml-2 hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full h-1 bg-[#414448] border-none">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{
                width: `${100 / tabs.length}%`,
                transform: `translateX(${
                  tabs.indexOf(tabs.find((t) => t.name === activeTab)) * 100
                }%)`,
              }}
            ></div>
          </div>
          <div className="w-full">{renderTabContent()}</div>
        </div>
      </div>
    </>
  );
};

export default ProfileVisit;
