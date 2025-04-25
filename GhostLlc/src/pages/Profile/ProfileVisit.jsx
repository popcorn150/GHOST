import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavBar from "./NavBar";
import BackButton from "../../components/BackButton";
import {
  BellAlertIcon,
  BellSlashIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
} from "@heroicons/react/24/outline";
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
} from "firebase/firestore";
import { auth, db } from "../../database/firebaseConfig";
import About from "../Profile/About";
import Socials from "../Profile/Socials";
import Favorites from "../Profile/Favourites";
import { FaImage } from "react-icons/fa";

const tabs = ["Uploads", "Bio", "Socials", "Favorites"];

const Uploads = ({ profileImage, userId }) => {
  const [uploadedAccounts, setUploadedAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!userId) {
        console.error("No userId provided to Uploads component");
        toast.error("Invalid user ID");
        setIsLoading(false);
        return;
      }

      console.log("Fetching accounts for userId:", userId);
      try {
        setIsLoading(true);
        setError(null);
        const q = query(
          collection(db, "accounts"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        console.log("Number of accounts found:", querySnapshot.size);

        const accounts = [];
        for (const docSnap of querySnapshot.docs) {
          const accountData = { id: docSnap.id, ...docSnap.data() };
          console.log("Processing account:", accountData.id);
          try {
            const imagesRef = collection(db, `accounts/${docSnap.id}/images`);
            const imagesSnap = await getDocs(imagesRef);
            const images = {};
            imagesSnap.forEach((imgDoc) => {
              images[imgDoc.id] = imgDoc.data().image || null;
            });
            accounts.push({ ...accountData, images });
          } catch (error) {
            console.error(
              `Error fetching images for account ${docSnap.id}:`,
              error
            );
            accounts.push({ ...accountData, images: {} });
          }
        }
        console.log("Fetched accounts:", accounts);
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
              className="relative bg-[#161B22]/80 p-4 rounded-xl shadow-lg border border-gray-800 transition-all duration-300 group"
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
                      ? `${acc.accountWorth} (${acc.currency || "USD"})`
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

const ProfileVisit = () => {
  const { userId } = useParams();
  const [notificationOn, setNotificationOn] = useState(false);
  const [inFavorites, setInFavorites] = useState(false);
  const [activeTab, setActiveTab] = useState("Uploads");
  const [profileData, setProfileData] = useState({
    username: "UnnamedUser",
    profileImage: null,
    bio: "",
    socials: { facebook: "", instagram: "", tiktok: "", twitter: "" },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserProfileImage, setCurrentUserProfileImage] = useState(null);

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

  useEffect(() => {
    const fetchProfileData = async () => {
      console.log("Fetching profile for userId:", userId);
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
          console.log("Profile data fetched:", data);
          setProfileData({
            username: data.username || "UnnamedUser",
            profileImage: data.profileImage || null,
            bio: data.bio || "No bio available.",
            socials: data.socials || {
              facebook: "",
              instagram: "",
              tiktok: "",
              twitter: "",
            },
          });

          if (auth.currentUser) {
            const currentUserDocRef = doc(db, "users", auth.currentUser.uid);
            const currentUserDocSnap = await getDoc(currentUserDocRef);
            if (
              currentUserDocSnap.exists() &&
              currentUserDocSnap.data().favorites
            ) {
              setInFavorites(
                currentUserDocSnap.data().favorites.includes(userId)
              );
            }
          } else {
            console.log("No authenticated user, skipping favorites check");
          }
        } else {
          console.error("User document does not exist for userId:", userId);
          toast.error("User not found.");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error(`Failed to load profile: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleNotificationToggle = () => {
    const turningOn = !notificationOn;

    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setNotificationOn(turningOn);
          resolve();
        }, 1500);
      }),
      {
        loading: turningOn
          ? "Turning on notifications..."
          : "Turning off notifications...",
        success: turningOn
          ? "Notifications turned on!"
          : "Notifications turned off!",
        error: "Something went wrong. Failed to toggle notifications.",
      }
    );
  };

  const handleFavorites = async () => {
    if (!auth.currentUser) {
      toast.error("Please log in to manage favorites.");
      return;
    }

    const addingToFavorites = !inFavorites;

    toast.promise(
      new Promise(async (resolve, reject) => {
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
          resolve();
        } catch (error) {
          console.error("Error updating favorites:", error);
          reject(error);
        }
      }),
      {
        loading: addingToFavorites
          ? "Adding to favorites..."
          : "Removing from favorites...",
        success: addingToFavorites
          ? "Added to favorites!"
          : "Removed from favorites!",
        error: "Something went wrong. Failed to update favorites.",
      }
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Uploads":
        return (
          <Uploads profileImage={profileData.profileImage} userId={userId} />
        );
      case "Bio":
        return <About bio={profileData.bio} readOnly={true} />;
      case "Socials":
        return <Socials socials={profileData.socials} readOnly={true} />;
      case "Favorites":
        return <Favorites userId={userId} />;
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

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6">
          <button
            onClick={handleFavorites}
            className={`flex items-center justify-center gap-2 px-4 py-2 
              border border-purple-500 text-purple-500 rounded-md 
              transition-all text-sm w-fit ${
                inFavorites ? "" : "bg-transparent"
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
            className={`flex items-center justify-center gap-2 px-4 py-2 
              border border-cyan-500 text-cyan-500 rounded-md
              transition-all text-sm w-fit ${
                notificationOn ? "" : "bg-transparent"
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
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 flex-1 text-center relative cursor-pointer ${
                  activeTab === tab
                    ? "text-white font-semibold"
                    : "text-gray-400"
                }`}
                aria-current={activeTab === tab ? "true" : "false"}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full h-1 bg-[#0E1115] border-none">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{
                width: `${100 / tabs.length}%`,
                transform: `translateX(${tabs.indexOf(activeTab) * 100}%)`,
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
