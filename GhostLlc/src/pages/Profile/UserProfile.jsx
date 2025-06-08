import { useState, useEffect, useRef } from "react";
import { auth, db } from "../../database/firebaseConfig";
import PropTypes from "prop-types";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import BackButton from "../../components/BackButton";
import { MdOutlineCameraEnhance } from "react-icons/md";
import { BsPencilSquare } from "react-icons/bs";
import {
  FaSave,
  FaTrashAlt,
  FaTrophy,
  FaInstagram,
  FaTiktok,
  FaImage,
  FaShareAlt,
  FaLink,
  FaWhatsapp,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { UploadCloud, User } from "lucide-react";
import { FaSquareFacebook, FaXTwitter } from "react-icons/fa6";
import { IoAdd } from "react-icons/io5";
import { LuUpload } from "react-icons/lu";
import {
  AlfredIcon,
  EntrepreneurIcon,
  FlexIcon,
  HawkIcon,
  MuscleIcon,
  PeacockIcon,
  RichhIcon,
  SplendidIcon,
} from "../../utils";

let imageCompression;
import("browser-image-compression").then((mod) => {
  imageCompression = mod.default;
});

const ALLOWED_CATEGORIES = [
  "Fighting",
  "Shooter",
  "Action",
  "Sport",
  "Adventure",
  "Racing",
  "Others",
];

const tabs = [
  { name: "Uploads", icon: UploadCloud },
  { name: "Bio", icon: User },
  { name: "Socials", icon: FaShareAlt },
  { name: "Achievements", icon: FaTrophy },
];

const initialAchievements = [
  {
    id: 1,
    title: "Flex",
    description: "Purchased up to 5 accounts in a day",
    img: FlexIcon,
    earned: false,
    progress: 0,
  },
  {
    id: 2,
    title: "Peacock",
    description: "Have up to 50 views for just an upload",
    img: PeacockIcon,
    earned: false,
    progress: 0,
  },
  {
    id: 3,
    title: "Entrepreneur",
    description: "Upload up to 10 accounts for sale",
    img: EntrepreneurIcon,
    earned: false,
    progress: 0,
  },
  {
    id: 4,
    title: "Big Spender",
    description: "Purchase a high selling account",
    img: RichhIcon,
    earned: false,
    progress: 0,
  },
  {
    id: 5,
    title: "Alfred (Suit up & Ready to Go)",
    description: "Complete setting up your profile account",
    img: AlfredIcon,
    earned: false,
    progress: 0,
  },
  {
    id: 6,
    title: "Hawk Eye",
    description: "Purchased an account within an hour of upload",
    img: HawkIcon,
    earned: false,
    progress: 0,
  },
  {
    id: 7,
    title: "Hustler",
    description: "Sold lots of accounts",
    img: MuscleIcon,
    earned: false,
    progress: 0,
  },
  {
    id: 8,
    title: "Splendid Taste",
    description: "Purchased an account that has lots of views",
    img: SplendidIcon,
    earned: false,
    progress: 0,
  },
];

const Achievements = ({ userId }) => {
  const [achievements, setAchievements] = useState(initialAchievements);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!userId) {
        setError("Invalid user ID");
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

          const mergedAchievements = initialAchievements.map((initAch) => {
            const userAch = achievementStatuses[initAch.id] || {
              earned: false,
              progress: 0,
            };
            return { ...initAch, ...userAch };
          });

          setAchievements(mergedAchievements);
        } else {
          setError("User not found.");
          toast.error("User not found.");
        }
      } catch (err) {
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
      <h3 className="text-start font-medium text-lg text-white mb-4">
        Earned {achievements.filter((a) => a.earned).length} out of{" "}
        {achievements.length}
      </h3>
      {achievements.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-2xl p-4 border shadow-xl transition-all duration-300 ${
                achievement.earned
                  ? "bg-gradient-to-br from-green-500/20 to-blue-500/10 border-green-500"
                  : "bg-zinc-900 border-zinc-700 opacity-50"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                {achievement.img ? (
                  <img
                    src={achievement.img}
                    alt={achievement.title}
                    className="h-16 mb-4"
                  />
                ) : (
                  <FaTrophy
                    className="h-16 mb-4 text-gray-400"
                    aria-label={achievement.title}
                  />
                )}
                <h3 className="text-lg font-semibold mb-1">
                  {achievement.title}
                </h3>
                <p className="text-sm text-zinc-400">
                  {achievement.description}
                </p>
              </div>
              <div className="mt-4 w-full">
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${achievement.progress}%` }}
                  ></div>
                </div>
                <p className="text-gray-300 text-sm mt-2">
                  Progress: {achievement.progress}%
                </p>
                {achievement.earned && (
                  <div className="mt-2 text-green-500 text-sm font-medium">
                    Unlocked ✓
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-400 text-sm sm:text-base font-light tracking-wider">
            No achievements available.
          </p>
        </div>
      )}
    </div>
  );
};

const Layout = ({
  activeTab,
  setActiveTab,
  children,
  username,
  profileImage,
  handleImageChange,
  isEditingUsername,
  setIsEditingUsername,
  tempUsername,
  setTempUsername,
  handleSaveUsername,
  handleDiscardUsername,
  isUpdatingUsername,
}) => {
  const [isProcessingProfileImage, setIsProcessingProfileImage] =
    useState(false);
  const fileInputRef = useRef(null);

  const handleImageChangeWrapper = async (event) => {
    setIsProcessingProfileImage(true);
    await handleImageChange(event);
    setIsProcessingProfileImage(false);
  };

  const handleCancelProfileImage = () => {
    setIsProcessingProfileImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <>
      <NavBar profileImage={profileImage || "/default-profile.png"} />
      <div className="flex flex-col items-center justify-center p-2">
        {isUpdatingUsername && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="flex flex-col items-center gap-3">
  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-l-4 border-r-4 border-t-[#0576FF] border-b-[#0576FF] border-l-transparent border-r-transparent"></div>
              <p className="text-white text-lg font-semibold">Processing...</p>
            </div>
          </div>
        )}
        <div className="w-full flex justify-start">
          <BackButton />
        </div>
        <div className="my-10 relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-[#0576FF]">
          <img
            src={profileImage || "/default-profile.png"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
          <label
            htmlFor="file-upload"
            className="absolute bottom-2 right-2 bg-black/50 p-2 rounded-full cursor-pointer hover:bg-black/70 transition"
            aria-label="Upload profile image"
          >
            <MdOutlineCameraEnhance className="text-white w-5 h-5" />
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChangeWrapper}
            ref={fileInputRef}
          />
          {isProcessingProfileImage && (
            <button
              onClick={handleCancelProfileImage}
              className="absolute bottom-2 left-2 bg-[#EB3223] p-2 rounded-full cursor-pointer hover:bg-[#B71C1C] transition"
              aria-label="Cancel profile image upload"
            >
              <FaTrashAlt className="text-white w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 mb-4">
          {isEditingUsername ? (
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <input
                type="text"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                className="p-2 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0576FF] text-xl font-semibold"
                aria-label="Edit username"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveUsername();
                  if (e.key === "Escape") handleDiscardUsername();
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveUsername}
                  className="flex items-center gap-2 bg-[#4426B9] text-white px-3 py-1 rounded-md hover:bg-[#2F1A7F] transition"
                  aria-label="Save username"
                >
                  <FaSave className="w-4 h-4" /> Save
                </button>
                <button
                  onClick={handleDiscardUsername}
                  className="flex items-center gap-2 bg-[#EB3223] text-white px-3 py-1 rounded-md hover:bg-[#B71C1C] transition"
                  aria-label="Discard username changes"
                >
                  <FaTrashAlt className="w-4 h-4" /> Discard
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-white text-xl font-semibold">
                {username || "User"}
              </h2>
              <button
                onClick={() => setIsEditingUsername(true)}
                className="flex items-center gap-2 border-2 border-[#0576FF] text-white px-2 py-1 rounded-md hover:bg-[#0576FF]/20 transition"
                aria-label="Edit username"
              >
                <BsPencilSquare className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        <div className="w-full px-4 sm:px-7 mx-auto">
          <div className="flex justify-between relative">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`py-2 flex-1 text-center cursor-pointer flex items-center justify-center gap-1 ${
                    activeTab === tab.name
                      ? "text-white font-semibold"
                      : "text-gray-400"
                  }`}
                  aria-label={tab.name}
                  title={tab.name}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm">{tab.name}</span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full h-1 bg-[#0E1115] border-none">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{
                width: `${100 / tabs.length}%`,
                transform: `translateX(${
                  tabs.findIndex((tab) => tab.name === activeTab) * 100
                }%)`,
              }}
            ></div>
          </div>
          <div className="w-full">{children}</div>
        </div>
      </div>
    </>
  );
};

const Uploads = ({
  profileImage,
  uploadedAccounts,
  setUploadedAccounts,
  fetchAccounts,
  username,
  userCurrency,
}) => {
  const [accountImage, setAccountImage] = useState(null);
  const [accountName, setAccountName] = useState("");
  const [accountCredential, setAccountCredential] = useState("");
  const [accountWorth, setAccountWorth] = useState("");
  const [accountDescription, setAccountDescription] = useState("");
  const [screenshots, setScreenshots] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showShareModal, setShowShareModal] = useState(null);
  const [accountCategory, setAccountCategory] = useState("");
  const [sellerCut, setSellerCut] = useState(null);
  const [ghostCut, setGhostCut] = useState(null); // Added for Ghost Cut
  const [isCalculatingCut, setIsCalculatingCut] = useState(false);
  const minScreenshots = 3;
  const maxScreenshots = 5;
  const maxDescriptionWords = 100;
  const accountImageInputRef = useRef(null);
  const screenshotInputRef = useRef(null);
  const shareModalRef = useRef(null);
  const navigate = useNavigate();

  // Mock exchange rates (1 unit of currency to NGN)
  const exchangeRatesToNGN = {
    USD: 1500,
    EUR: 1600,
    GBP: 1800,
    NGN: 1,
  };

  const formatNumberWithCommas = (value) => {
    if (!value) return "";
    const cleanedValue = value.replace(/[^0-9.]/g, "");
    const parts = cleanedValue.split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const decimalPart = parts.length > 1 ? `.${parts[1].slice(0, 2)}` : "";
    return integerPart + decimalPart;
  };

  const handleAccountWorthChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    setAccountWorth(rawValue);
    if (rawValue && !isNaN(parseFloat(rawValue))) {
      calculateSellerCut(rawValue);
    } else {
      setSellerCut(null);
      setGhostCut(null); // Reset Ghost Cut
      setIsCalculatingCut(false);
    }
  };

  const calculateSellerCut = async (worth) => {
    setIsCalculatingCut(true);
    try {
      // Simulate async calculation for UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      const worthInUserCurrency = parseFloat(worth);
      const rateToNGN = exchangeRatesToNGN[userCurrency] || 1500; // Default to USD if unknown
      const worthInNGN = worthInUserCurrency * rateToNGN;

      // Apply cut based on NGN amount
      let sellerPercentage = worthInNGN > 100000 ? 0.8 : 0.85; // 80% for >100k, 85% for <=100k
      const sellerCutInNGN = worthInNGN * sellerPercentage;
      const ghostCutInNGN = worthInNGN * (1 - sellerPercentage); // Platform's cut (20% or 15%)

      // Convert back to user currency
      const sellerCutInUserCurrency = sellerCutInNGN / rateToNGN;
      const ghostCutInUserCurrency = ghostCutInNGN / rateToNGN;

      setSellerCut(sellerCutInUserCurrency.toFixed(2));
      setGhostCut(ghostCutInUserCurrency.toFixed(2)); // Set Ghost Cut
    } catch (err) {
      console.error("Error calculating cuts:", err);
      setSellerCut(null);
      setGhostCut(null);
    } finally {
      setIsCalculatingCut(false);
    }
  };

  useEffect(() => {
    if (editingAccount && editingAccount.accountWorth) {
      setAccountWorth(editingAccount.accountWorth.toString());
      calculateSellerCut(editingAccount.accountWorth.toString());
    }
  }, [editingAccount]);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(compressedFile);
      });
    } catch (error) {
      console.error("Error compressing image:", error);
      throw error;
    }
  };

  const handleAccountImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setIsProcessing(true);
        const compressedImage = await compressImage(file);
        setAccountImage(compressedImage);
      } catch (error) {
        toast.error("Failed to process account image.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCancelAccountImage = () => {
    setAccountImage(null);
    if (accountImageInputRef.current) {
      accountImageInputRef.current.value = null;
    }
  };

  const handleScreenshotUpload = async (event) => {
    if (screenshots.length < maxScreenshots) {
      const file = event.target.files[0];
      if (file) {
        try {
          setIsProcessing(true);
          const compressedImage = await compressImage(file);
          setScreenshots([...screenshots, compressedImage]);
        } catch (error) {
          toast.error("Failed to process screenshot.");
        } finally {
          setIsProcessing(false);
        }
      }
    }
  };

  const handleRemoveScreenshot = (index) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
    if (screenshotInputRef.current) {
      screenshotInputRef.current.value = null;
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setAccountName(account.accountName);
    setAccountCredential(account.accountCredential);
    setAccountWorth(account.accountWorth.toString());
    setAccountDescription(account.accountDescription);
    setAccountCategory(account.category || "");
    setAccountImage(account.images?.accountImage || null);
    setScreenshots(
      Object.keys(account.images || {})
        .filter((key) => key.startsWith("screenshot"))
        .map((key) => account.images[key])
        .filter(Boolean)
    );
    setIsUploading(true);
  };

  const handleUpdate = async () => {
    if (!auth.currentUser || !editingAccount) return;

    if (
      !accountName ||
      !accountCredential ||
      !accountWorth ||
      !accountDescription ||
      !accountCategory
    ) {
      toast.error("Please fill out all required fields.");
      return;
    }
    if (!ALLOWED_CATEGORIES.includes(accountCategory)) {
      toast.error("Please select a valid category.");
      return;
    }
    if (screenshots.length < minScreenshots) {
      toast.error(`Please upload at least ${minScreenshots} screenshots.`);
      return;
    }
    const wordCount = accountDescription.trim().split(/\s+/).length;
    if (wordCount > maxDescriptionWords) {
      toast.error(
        `Description exceeds ${maxDescriptionWords} words (current: ${wordCount}).`
      );
      return;
    }
    if (isNaN(parseFloat(accountWorth))) {
      toast.error("Account worth must be a valid number.");
      return;
    }

    try {
      setIsProcessing(true);
      const accountDocRef = doc(db, "accounts", editingAccount.id);
      await updateDoc(accountDocRef, {
        accountName,
        accountCredential,
        accountWorth: parseFloat(accountWorth),
        accountDescription,
        category: accountCategory,
        updatedAt: new Date(),
      });

      const imagesRef = collection(db, `accounts/${editingAccount.id}/images`);
      if (accountImage) {
        await setDoc(doc(imagesRef, "accountImage"), { image: accountImage });
      } else {
        await deleteDoc(doc(imagesRef, "accountImage"));
      }
      const existingImages = await getDocs(imagesRef);
      for (const imgDoc of existingImages.docs) {
        if (imgDoc.id.startsWith("screenshot")) {
          await deleteDoc(doc(imagesRef, imgDoc.id));
        }
      }
      for (let i = 0; i < screenshots.length; i++) {
        await setDoc(doc(imagesRef, `screenshot${i}`), {
          image: screenshots[i],
        });
      }

      resetForm();
      setEditingAccount(null);
      fetchAccounts();
      toast.success("Account updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update account: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = (account) => {
    setShowShareModal(account);
  };

  const copyLink = (account) => {
    const shareUrl = `${window.location.origin}/categories`;
    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost"
    ) {
      console.warn("Clipboard API requires HTTPS or localhost.");
      toast.error("Copy link requires a secure context. Please copy manually.");
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          toast.success(`Link for ${account.accountName} copied!`);
        })
        .catch((err) => {
          console.error("Clipboard error:", err);
          fallbackCopyLink(shareUrl, account.accountName);
        });
    } else {
      fallbackCopyLink(shareUrl, account.accountName);
    }
  };

  const fallbackCopyLink = (text, accountName) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      toast.success(`Link for ${accountName} copied!`);
    } catch (err) {
      console.error("Fallback copy failed:", err);
      toast.error(`Failed to copy link for ${accountName}.`);
    }
  };

  const shareToSocial = (platform, account) => {
    const shareUrl = `${window.location.origin}/categories`;
    const text = `Check out "${account.accountName}" on our platform!`;
    let url = "";

    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}&quote=${encodeURIComponent(text)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent(text)}`;
        break;
      case "whatsapp":
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          text + " " + shareUrl
        )}`;
        break;
      default:
        return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
    setShowShareModal(null);
  };

  const handleUpload = async () => {
    if (editingAccount) {
      await handleUpdate();
    } else {
      if (!auth.currentUser) {
        toast.error("Please log in to upload an account.");
        return;
      }
      if (
        !accountName ||
        !accountCredential ||
        !accountWorth ||
        !accountDescription ||
        !accountCategory
      ) {
        toast.error("Please fill out all required fields.");
        return;
      }
      if (!ALLOWED_CATEGORIES.includes(accountCategory)) {
        toast.error("Please select a valid category.");
        return;
      }
      if (screenshots.length < minScreenshots) {
        toast.error(`Please upload at least ${minScreenshots} screenshots.`);
        return;
      }
      const wordCount = accountDescription.trim().split(/\s+/).length;
      if (wordCount > maxDescriptionWords) {
        toast.error(
          `Description exceeds ${maxDescriptionWords} words (current: ${wordCount}).`
        );
        return;
      }
      if (isNaN(parseFloat(accountWorth))) {
        toast.error("Account worth must be a valid number.");
        return;
      }

      try {
        setIsProcessing(true);
        const userId = auth.currentUser.uid;
        const uploadData = {
          userId,
          username,
          accountName,
          accountCredential,
          accountWorth: parseFloat(accountWorth),
          accountDescription,
          category: accountCategory,
          createdAt: new Date(),
          currency: userCurrency,
          views: 0,
        };
        const accountDocRef = await addDoc(
          collection(db, "accounts"),
          uploadData
        );

        const imagesRef = collection(db, `accounts/${accountDocRef.id}/images`);
        if (accountImage) {
          await setDoc(doc(imagesRef, "accountImage"), { image: accountImage });
        }
        for (let i = 0; i < screenshots.length; i++) {
          await setDoc(doc(imagesRef, `screenshot${i}`), {
            image: screenshots[i],
          });
        }

        // Update "Entrepreneur" achievement (ID 3)
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        let totalAccountsUploaded = 0;
        if (userDoc.exists()) {
          totalAccountsUploaded =
            (userDoc.data().totalAccountsUploaded || 0) + 1;
        } else {
          totalAccountsUploaded = 1;
        }
        const progress = Math.min((totalAccountsUploaded / 10) * 100, 100);
        await updateDoc(userDocRef, {
          totalAccountsUploaded,
          [`achievementStatuses.3.progress`]: progress,
          [`achievementStatuses.3.earned`]: progress >= 100,
        });

        resetForm();
        fetchAccounts();
        toast.success("Account uploaded successfully!");
      } catch (err) {
        console.error("Upload error:", err.code, err.message);
        toast.error("Failed to upload account: " + err.message);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDelete = async (account) => {
    try {
      setIsProcessing(true);
      await deleteDoc(doc(db, "accounts", account.id));
      fetchAccounts();
      toast.success("Account deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete account: " + err.message);
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(null);
    }
  };

  const resetForm = () => {
    setAccountName("");
    setAccountCredential("");
    setAccountWorth("");
    setAccountDescription("");
    setAccountCategory("");
    setAccountImage(null);
    setScreenshots([]);
    setIsUploading(false);
    setEditingAccount(null);
    setSellerCut(null);
    setGhostCut(null); // Reset Ghost Cut
    setIsCalculatingCut(false);
    if (accountImageInputRef.current) {
      accountImageInputRef.current.value = null;
    }
    if (screenshotInputRef.current) {
      screenshotInputRef.current.value = null;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showShareModal) {
        setShowShareModal(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showShareModal]);

  const handleNavigateToCategories = () => {
    navigate("/categories");
  };

  return (
    <div className="p-2">
      {isProcessing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-l-4 border-r-4 border-t-[#0576FF] border-b-[#0576FF] border-l-transparent border-r-transparent"></div>
            <p className="text-white text-lg font-semibold">Processing...</p>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-[#161B22] p-6 rounded-xl border border-gray-800 max-w-sm w-full mx-4">
            <h3 className="text-white text-lg font-semibold mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the account "
              {showDeleteConfirm.accountName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-[#EB3223] text-white rounded-md hover:bg-[#B71C1C] transition"
                aria-label="Confirm deletion"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showShareModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          ref={shareModalRef}
        >
          <div className="bg-[#161B22] p-6 rounded-xl border border-gray-800 max-w-sm w-full mx-4">
            <h3 className="text-white text-lg font-semibold mb-4">
              Share {showShareModal.accountName}
            </h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => copyLink(showShareModal)}
                className="flex items-center gap-2 bg-[#0576FF] text-white px-4 py-2 rounded-md hover:bg-[#045FCC] transition"
                aria-label={`Copy link for ${showShareModal.accountName}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    copyLink(showShareModal);
                  }
                }}
              >
                <FaLink className="w-4 h-4" /> Copy Link
              </button>
              <button
                onClick={() => shareToSocial("facebook", showShareModal)}
                className="flex items-center gap-2 bg-[#4267B2] text-white px-4 py-2 rounded-md hover:bg-[#365899] transition"
                aria-label={`Share ${showShareModal.accountName} to Facebook`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    shareToSocial("facebook", showShareModal);
                  }
                }}
              >
                <FaSquareFacebook className="w-4 h-4" /> Facebook
              </button>
              <button
                onClick={() => shareToSocial("twitter", showShareModal)}
                className="flex items-center gap-2 bg-[#000000] text-white px-4 py-2 rounded-md hover:bg-[#333333] transition"
                aria-label={`Share ${showShareModal.accountName} to Twitter`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    shareToSocial("twitter", showShareModal);
                  }
                }}
              >
                <FaXTwitter className="w-4 h-4" /> Twitter
              </button>
              <button
                onClick={() => shareToSocial("whatsapp", showShareModal)}
                className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-md hover:bg-[#20B158] transition"
                aria-label={`Share ${showShareModal.accountName} to WhatsApp`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    shareToSocial("whatsapp", showShareModal);
                  }
                }}
              >
                <FaWhatsapp className="w-4 h-4" /> WhatsApp
              </button>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowShareModal(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                aria-label="Close share modal"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setShowShareModal(null);
                  }
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col mb-12 sm:flex-row justify-between items-center gap-4 sm:gap-10 p-3 xs:p-4 sm:p-6 my-3 border border-gray-200 rounded-lg">
        <h2 className="text-white text-md xs:text-lg sm:text-xl text-center sm:text-left font-semibold tracking-wide">
          {editingAccount ? "Edit Account" : "Upload An Account"}
        </h2>
        <button
          className="bg-gray-400 rounded-lg cursor-pointer p-2 hover:bg-gray-500 transition-all duration-300"
          onClick={() => {
            if (editingAccount) {
              resetForm();
            }
            setIsUploading(!isUploading);
          }}
          aria-label={isUploading ? "Close form" : "Open form"}
        >
          <IoAdd className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7" />
        </button>
      </div>

      {isUploading && (
        <div className="bg-[#0E1115] p-4 sm:p-6 rounded-lg border border-gray-600 mb-12">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-4">
              <div className="relative w-full max-w-[450px] mx-auto aspect-[4/3] border-2 border-[#0576FF] rounded-xl overflow-hidden">
                <label
                  htmlFor="account-image-upload"
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                  aria-label="Upload account image"
                >
                  {accountImage ? (
                    <img
                      src={accountImage}
                      alt="Account"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <MdOutlineCameraEnhance className="text-gray-500 w-12 h-12 sm:w-16 sm:h-16" />
                      <p className="text-gray-400 text-xs sm:text-sm text-center mt-2">
                        Click to upload account image
                      </p>
                    </>
                  )}
                </label>
                {accountImage && (
                  <button
                    onClick={handleCancelAccountImage}
                    className="absolute top-2 right-2 bg-[#EB3223] p-2 rounded-full cursor-pointer hover:bg-[#B71C1C] transition"
                    aria-label="Remove account image"
                  >
                    <FaTrashAlt className="text-white w-4 h-4" />
                  </button>
                )}
                <input
                  id="account-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAccountImageUpload}
                  ref={accountImageInputRef}
                />
              </div>
              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="Name of Account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full max-w-[450px] mx-auto p-3 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9] text-sm"
                  required
                  aria-label="Account name"
                />
                <input
                  type="text"
                  placeholder="Account Credential"
                  value={accountCredential}
                  onChange={(e) => setAccountCredential(e.target.value)}
                  className="w-full max-w-[450px] mx-auto p-3 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9] text-sm"
                  required
                  aria-label="Account credential"
                />
                <input
                  type="text"
                  placeholder={`Account's Worth (in ${userCurrency})`}
                  value={formatNumberWithCommas(accountWorth)}
                  onChange={handleAccountWorthChange}
                  className="w-full max-w-[450px] mx-auto p-3 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9] text-sm"
                  required
                  aria-label={`Account worth in ${userCurrency}`}
                />
                <div className="w-full max-w-[450px] mx-auto text-sm text-gray-400">
                  {isCalculatingCut ? (
                    <p>Calculating cuts...</p>
                  ) : sellerCut && ghostCut ? (
                    <div className="flex flex-col gap-1">
                      <p>
                        Seller's Cut:{" "}
                        <span className="text-green-500 font-medium">
                          {formatNumberWithCommas(sellerCut)} {userCurrency}
                        </span>
                      </p>
                      <p>
                        Ghost Cut:{" "}
                        <span className="text-red-500 font-medium">
                          {formatNumberWithCommas(ghostCut)} {userCurrency}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p>Enter account worth to see cuts.</p>
                  )}
                </div>
                <select
                  value={accountCategory}
                  onChange={(e) => setAccountCategory(e.target.value)}
                  className="w-full max-w-[450px] mx-auto p-3 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9] text-sm"
                  required
                  aria-label="Account category"
                >
                  <option value="">Select Account Category</option>
                  {ALLOWED_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-gray-400 text-sm">
                  Selected Category: {accountCategory || "None"}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <textarea
                placeholder={`Full Account Description (max ${maxDescriptionWords} words)`}
                value={accountDescription}
                onChange={(e) => setAccountDescription(e.target.value)}
                className="w-full h-[200px] sm:h-[240px] p-3 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9] text-sm resize-none"
                required
                aria-label="Account description"
              ></textarea>
            </div>
          </div>
          <div className="mt-6 border border-gray-300 p-4 sm:p-5 rounded-lg">
            <p className="text-white text-lg font-semibold mb-2">Screenshots</p>
            <p className="text-gray-400 text-sm mb-3">
              Minimum {minScreenshots}, Maximum {maxScreenshots}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {screenshots.map((src, index) => (
                <div key={index} className="relative">
                  <img
                    src={src}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-24 sm:h-28 lg:h-32 object-cover rounded-md"
                  />
                  <button
                    onClick={() => handleRemoveScreenshot(index)}
                    className="absolute top-1 right-1 bg-[#EB3223] p-1.5 rounded-full cursor-pointer hover:bg-[#B71C1C] transition"
                    aria-label={`Remove screenshot ${index + 1}`}
                  >
                    <FaTrashAlt className="text-white w-3 h-3" />
                  </button>
                </div>
              ))}
              {screenshots.length < maxScreenshots && (
                <label
                  htmlFor="screenshot-upload"
                  className="w-full h-24 sm:h-28 lg:h-32 rounded-md flex items-center justify-center bg-gray-700 cursor-pointer"
                  aria-label="Upload screenshot"
                >
                  <MdOutlineCameraEnhance className="text-white w-6 h-6 sm:w-8 sm:h-8" />
                </label>
              )}
              <input
                id="screenshot-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScreenshotUpload}
                ref={screenshotInputRef}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end mt-6 gap-3 sm:gap-4">
            <button
              onClick={resetForm}
              className="flex items-center justify-center gap-2 text-white font-medium bg-[#EB3223] px-4 py-2 rounded-lg cursor-pointer w-full sm:w-32 hover:bg-[#B71C1C] transition"
              aria-label="Discard form"
            >
              <FaTrashAlt className="w-4 h-4" /> Discard
            </button>
            <button
              onClick={handleUpload}
              className="flex items-center justify-center gap-2 text-white font-medium bg-[#4426B9] px-4 py-2 rounded-lg cursor-pointer w-full sm:w-32 hover:bg-[#2F1A7F] transition"
              aria-label={editingAccount ? "Update account" : "Upload account"}
            >
              {editingAccount ? (
                <>
                  <FaSave className="w-4 h-4" /> Update
                </>
              ) : (
                <>
                  <LuUpload className="w-4 h-4" /> Upload
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-screen-2xl mx-auto p-4 sm:p-6 lg:px-8 py-6 bg-gradient-to-br from-[#0E1115] via-[#1A1F29] to-[#252A36] rounded-xl border border-gray-800 mt-8">
        <h2 className="text-gray-100 text-lg sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-wider mb-6 md:mb-8 lg:mb-10">
          Accounts Uploaded
        </h2>
        {uploadedAccounts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {uploadedAccounts.map((acc) => (
              <div
                key={acc.id}
                className="w-full min-w-[240px] bg-[#161B22]/80 p-4 rounded-xl shadow-lg border border-gray-800 active:scale-95 transition-all duration-300 group cursor-pointer"
                onClick={handleNavigateToCategories}
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
                    <span className="text-xs break-all">
                      {acc.accountCredential}
                    </span>
                  </p>
                  <p className="text-gray-200 text-xs sm:text-sm tracking-wider leading-relaxed">
                    <span className="text-[#0576FF] font-bold text-xs">
                      Worth:
                    </span>{" "}
                    <span className="text-xs">
                      {formatNumberWithCommas(acc.accountWorth.toString())} (
                      {acc.currency || userCurrency})
                    </span>
                  </p>
                  <p className="text-gray-200 text-xs sm:text-sm tracking-wider leading-relaxed line-clamp-2">
                    <span className="text-[#0576FF] font-bold text-xs">
                      Description:
                    </span>{" "}
                    <span className="text-xs">{acc.accountDescription}</span>
                  </p>
                </div>

                {acc.images &&
                Object.keys(acc.images).filter((key) =>
                  key.startsWith("screenshot")
                ).length > 0 ? (
                  <div className="mb-2">
                    <p className="text-gray-200 text-xs md:text-sm font-bold tracking-wider mb-2">
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
                                className="w-full h-16 md:h-20 object-cover rounded-md shadow-sm transition-transform duration-300 group-hover/screenshot:scale-105"
                                style={{ aspectRatio: "4/3" }}
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/screenshot:opacity-100 transition-opacity duration-300 rounded-md"></div>
                            </div>
                          ) : (
                            <div
                              key={index}
                              className="w-full h-16 md:h-20 bg-gradient-to-br from-[#1A1F29] to-[#252A36] flex items-center justify-center rounded-md shadow-sm"
                            >
                              <FaImage className="text-gray-500 w-4 h-4 md:w-6 md:h-6" />
                            </div>
                          )
                        )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs md:text-sm font-light tracking-wider mb-2">
                    No screenshots available.
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(acc);
                    }}
                    className="flex items-center justify-center bg-[#0576FF]/80 text-white p-1.5 sm:p-2 rounded-full hover:bg-[#0576FF] active:bg-[#045FCC] transition-all duration-300 w-8 h-8 sm:w-9 sm:h-9"
                    aria-label={`Share account ${acc.accountName}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleShare(acc);
                      }
                    }}
                  >
                    <FaShareAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(acc);
                      }}
                      className="flex items-center justify-center bg-[#4426B9]/80 text-white p-1.5 sm:p-2 rounded-full hover:bg-[#4426B9] active:bg-[#2F1A7F] transition-all duration-300 w-8 h-8 sm:w-9 sm:h-9"
                      aria-label={`Edit account ${acc.accountName}`}
                    >
                      <BsPencilSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(acc);
                      }}
                      className="flex items-center justify-center bg-[#EB3223]/80 text-white p-1.5 sm:p-2 rounded-full hover:bg-[#EB3223] active:bg-[#B71C1C] transition-all duration-300 w-8 h-8 sm:w-9 sm:h-9"
                      aria-label={`Delete account ${acc.accountName}`}
                    >
                      <FaTrashAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-10 text-gray-400 text-center text-sm sm:text-base font-light tracking-wider">
            No accounts uploaded yet.
          </p>
        )}
      </div>
    </div>
  );
};

const About = ({ handleSaveBio }) => {
  const [aboutText, setAboutText] = useState(
    "Write a little something about yourself. It helps communicate with your visitors."
  );
  const [tempText, setTempText] = useState(aboutText);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => setIsEditing(true);
  const handleDiscard = () => {
    setTempText(aboutText);
    setIsEditing(false);
  };
  const handleSave = async () => {
    setAboutText(tempText);
    setIsEditing(false);
    await handleSaveBio(tempText);
  };

  useEffect(() => {
    const fetchBio = async () => {
      if (auth.currentUser) {
        try {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().bio) {
            setAboutText(userDoc.data().bio);
            setTempText(userDoc.data().bio);
          }
        } catch (error) {
          console.error("Error fetching bio:", error);
        }
      }
    };
    fetchBio();
  }, []);

  return (
    <div className="p-5">
      <textarea
        className="w-full h-60 p-3 border border-gray-600 rounded-md bg-[#0E1115] text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0576FF]"
        value={tempText}
        onChange={(e) => setTempText(e.target.value)}
        readOnly={!isEditing}
        aria-label="User bio"
      ></textarea>
      <div className="mt-4 flex justify-end gap-3">
        {isEditing ? (
          <>
            <button
              onClick={handleDiscard}
              className="flex items-center gap-2 bg-[#EB3223] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[#B71C1C] transition"
              aria-label="Discard bio changes"
            >
              <FaTrashAlt /> Discard
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#4426B9] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[#2F1A7F] transition"
              aria-label="Save bio"
            >
              <FaSave /> Save
            </button>
          </>
        ) : (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 bg-[#0576FF] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[#045FCC] transition"
            aria-label="Edit bio"
          >
            <BsPencilSquare /> Edit
          </button>
        )}
      </div>
    </div>
  );
};

const Socials = ({ handleSaveSocials, profileData }) => {
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    tiktok: "",
    twitter: "",
    facebook: "",
  });
  const [tempLinks, setTempLinks] = useState(socialLinks);
  const [isEditing, setIsEditing] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const popupRef = useRef(null);

  const handleEdit = () => setIsEditing(true);
  const handleDiscard = () => {
    setTempLinks(socialLinks);
    setIsEditing(false);
  };
  const handleSave = async () => {
    setSocialLinks(tempLinks);
    setIsEditing(false);
    await handleSaveSocials(tempLinks);
  };

  const handleChange = (platform, value) => {
    setTempLinks({ ...tempLinks, [platform]: value });
  };

  const completionIndicators = [
    {
      label: "Username",
      completed:
        !!profileData.username && profileData.username !== "UnnamedUser",
    },
    {
      label: "Profile Image",
      completed: !!profileData.profileImage,
    },
    {
      label: "Bio",
      completed: !!profileData.bio && profileData.bio.trim() !== "",
    },
    {
      label: "Socials",
      completed: Object.values(socialLinks).some(
        (val) => val && val.trim() !== ""
      ),
    },
  ];

  const completedCount = completionIndicators.filter(
    (indicator) => indicator.completed
  ).length;
  const totalIndicators = completionIndicators.length;
  const isProfileComplete = completedCount === totalIndicators;

  useEffect(() => {
    const fetchSocials = async () => {
      if (auth.currentUser) {
        try {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().socials) {
            setSocialLinks(userDoc.data().socials);
            setTempLinks(userDoc.data().socials);
          }
        } catch (error) {
          console.error("Error fetching social links:", error);
          toast.error("Failed to fetch social links: " + error.message);
        }
      }
    };
    fetchSocials();
  }, []);

  useEffect(() => {
    if (!isProfileComplete && !sessionStorage.getItem("completionPopupShown")) {
      setShowCompletionPopup(true);
      sessionStorage.setItem("completionPopupShown", "true");
    }
  }, [isProfileComplete]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showCompletionPopup) {
        setShowCompletionPopup(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showCompletionPopup]);

  return (
    <div className="mt-16 mb-20 p-4 sm:p-6 bg-[#161B22] rounded-xl border border-gray-800 shadow-lg">
      {showCompletionPopup && !isProfileComplete && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          role="dialog"
          aria-labelledby="completion-popup-title"
          aria-describedby="completion-popup-description"
          ref={popupRef}
        >
          <div className="bg-[#161B22] p-6 sm:p-8 rounded-xl border border-gray-800 max-w-sm w-full mx-4 shadow-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/10">
            <div className="flex items-center gap-3 mb-4">
              <FaCheckCircle className="text-blue-400 w-8 h-8 animate-pulse" />
              <h3
                id="completion-popup-title"
                className="text-white text-lg sm:text-xl font-semibold"
              >
                Complete Your Profile!
              </h3>
            </div>
            <p
              id="completion-popup-description"
              className="text-gray-300 text-sm sm:text-base mb-6"
            >
              Your profile is {completedCount}/{totalIndicators} complete.
              Finish setting up to unlock the "Alfred" achievement and enhance
              your presence!
            </p>
            <ul className="text-gray-300 text-sm mb-6">
              {completionIndicators.map((indicator, index) => (
                <li key={index} className="flex items-center gap-2 mb-2">
                  {indicator.completed ? (
                    <FaCheckCircle className="text-green-500 w-4 h-4" />
                  ) : (
                    <FaTimesCircle className="text-red-500 w-4 h-4" />
                  )}
                  <span>{indicator.label}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCompletionPopup(false)}
                className="bg-[#4426B9] text-white px-4 py-2 rounded-lg hover:bg-[#2F1A7F] transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#0576FF]"
                aria-label="Dismiss profile completion popup"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setShowCompletionPopup(false);
                  }
                }}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
      <h2 className="text-white text-xl sm:text-2xl font-semibold tracking-wider mb-6 flex items-center gap-2">
        <FaShareAlt className="w-6 h-6 text-[#0576FF]" />
        Socials
      </h2>
      {isEditing ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-[#0E1115] p-3 rounded-lg border border-gray-600 focus-within:ring-2 focus-within:ring-[#0576FF] transition">
              <FaInstagram className="text-pink-500 w-6 h-6" />
              <input
                type="text"
                placeholder="Instagram handle"
                value={tempLinks.instagram}
                onChange={(e) => handleChange("instagram", e.target.value)}
                className="w-full bg-transparent text-white text-sm focus:outline-none"
                aria-label="Instagram handle"
              />
            </div>
            <div className="flex items-center gap-3 bg-[#0E1115] p-3 rounded-lg border border-gray-600 focus-within:ring-2 focus-within:ring-[#0576FF] transition">
              <FaTiktok className="text-white w-6 h-6" />
              <input
                type="text"
                placeholder="TikTok handle"
                value={tempLinks.tiktok}
                onChange={(e) => handleChange("tiktok", e.target.value)}
                className="w-full bg-transparent text-white text-sm focus:outline-none"
                aria-label="TikTok handle"
              />
            </div>
            <div className="flex items-center gap-3 bg-[#0E1115] p-3 rounded-lg border border-gray-600 focus-within:ring-2 focus-within:ring-[#0576FF] transition">
              <FaXTwitter className="text-blue-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Twitter handle"
                value={tempLinks.twitter}
                onChange={(e) => handleChange("twitter", e.target.value)}
                className="w-full bg-transparent text-white text-sm focus:outline-none"
                aria-label="Twitter handle"
              />
            </div>
            <div className="flex items-center gap-3 bg-[#0E1115] p-3 rounded-lg border border-gray-600 focus-within:ring-2 focus-within:ring-[#0576FF] transition">
              <FaSquareFacebook className="text-blue-600 w-6 h-6" />
              <input
                type="text"
                placeholder="Facebook handle"
                value={tempLinks.facebook}
                onChange={(e) => handleChange("facebook", e.target.value)}
                className="w-full bg-transparent text-white text-sm focus:outline-none"
                aria-label="Facebook handle"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleDiscard}
              className="flex items-center gap-2 bg-[#EB3223] text-white px-4 py-2 rounded-lg hover:bg-[#B71C1C] transition transform hover:scale-105"
              aria-label="Discard socials changes"
            >
              <FaTrashAlt className="w-4 h-4" /> Discard
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#4426B9] text-white px-4 py-2 rounded-lg hover:bg-[#2F1A7F] transition transform hover:scale-105"
              aria-label="Save socials"
            >
              <FaSave className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {socialLinks.instagram && (
              <a
                href={`https://instagram.com/${socialLinks.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#0E1115] p-3 rounded-lg border border-gray-600 hover:bg-[#1A1F29] hover:border-[#0576FF] transition"
              >
                <FaInstagram className="text-pink-500 w-6 h-6" />
                <div>
                  <p className="text-white text-sm font-medium">Instagram</p>
                  <p className="text-gray-400 text-xs">
                    {socialLinks.instagram}
                  </p>
                </div>
              </a>
            )}
            {socialLinks.tiktok && (
              <a
                href={`https://tiktok.com/@${socialLinks.tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#0E1115] p-3 rounded-lg border border-gray-600 hover:bg-[#1A1F29] hover:border-[#0576FF] transition"
              >
                <FaTiktok className="text-white w-6 h-6" />
                <div>
                  <p className="text-white text-sm font-medium">TikTok</p>
                  <p className="text-gray-400 text-xs">{socialLinks.tiktok}</p>
                </div>
              </a>
            )}
            {socialLinks.twitter && (
              <a
                href={`https://twitter.com/${socialLinks.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#0E1115] p-3 rounded-lg border border-gray-600 hover:bg-[#1A1F29] hover:border-[#0576FF] transition"
              >
                <FaXTwitter className="text-blue-400 w-6 h-6" />
                <div>
                  <p className="text-white text-sm font-medium">Twitter</p>
                  <p className="text-gray-400 text-xs">{socialLinks.twitter}</p>
                </div>
              </a>
            )}
            {socialLinks.facebook && (
              <a
                href={`https://facebook.com/${socialLinks.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#0E1115] p-3 rounded-lg border border-gray-600 hover:bg-[#1A1F29] hover:border-[#0576FF] transition"
              >
                <FaSquareFacebook className="text-blue-600 w-6 h-6" />
                <div>
                  <p className="text-white text-sm font-medium">Facebook</p>
                  <p className="text-gray-400 text-xs">
                    {socialLinks.facebook}
                  </p>
                </div>
              </a>
            )}
          </div>
          {Object.values(socialLinks).every((val) => !val) && (
            <p className="text-gray-400 text-sm text-center">
              No social links added yet. Click "Edit Socials" to add some!
            </p>
          )}
          <div className="flex justify-end">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-gradient-to-r from-[#0576FF] to-[#4426B9] text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-105 hover:border-[#0576FF] border border-transparent transition-all duration-300 text-base font-medium"
              aria-label="Edit socials"
            >
              <BsPencilSquare className="w-4 h-4" /> Edit Socials
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("Uploads");
  const [uploadedAccounts, setUploadedAccounts] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState("UnnamedUser");
  const [tempUsername, setTempUsername] = useState(username);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "UnnamedUser",
    profileImage: null,
    bio: "",
    socials: { instagram: "", tiktok: "", twitter: "", facebook: "" },
  });
  const [userCurrency, setUserCurrency] = useState("USD");
  const [showAlfredAlert, setShowAlfredAlert] = useState(true);
  const [showAlfredPopup, setShowAlfredPopup] = useState(false);
  const navigate = useNavigate();
  const popupRef = useRef(null);

  const fetchAccounts = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, "accounts"),
        where("userId", "==", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const accounts = [];
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const imagesRef = collection(db, `accounts/${docSnap.id}/images`);
        const imagesSnap = await getDocs(imagesRef);
        const images = {};
        imagesSnap.forEach((imgDoc) => {
          images[imgDoc.id] = imgDoc.data().image;
        });
        accounts.push({ id: docSnap.id, ...data, images });
      }
      setUploadedAccounts(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to fetch accounts: " + error.message);
    }
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(compressedFile);
      });
    } catch (error) {
      console.error("Error compressing image:", error);
      throw error;
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const compressedImage = await compressImage(file);
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, { profileImage: compressedImage });
        setProfileImage(compressedImage);
        setProfileData((prev) => ({ ...prev, profileImage: compressedImage }));
        toast.success("Profile image updated successfully!");
      } catch (error) {
        console.error("Error updating profile image:", error);
        toast.error("Failed to update profile image: " + error.message);
      }
    }
  };
  
  const handleSaveUsername = async () => {
    if (tempUsername.trim() === "") {
      toast.error("Username cannot be empty.");
      return;
    }
    if (tempUsername === username) {
      setIsEditingUsername(false);
      return;
    }
    try {
      setIsUpdatingUsername(true);
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, { username: tempUsername.trim() });
      setUsername(tempUsername.trim());
      setProfileData((prev) => ({ ...prev, username: tempUsername.trim() }));
      setIsEditingUsername(false);
      toast.success("Username updated successfully!");
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error("Failed to update username: " + error.message);
    } finally {
      setIsUpdatingUsername(false);
    }
  };
  
  const handleDiscardUsername = () => {
    setTempUsername(username);
    setIsEditingUsername(false);
  };
  
  const handleSaveBio = async (bio) => {
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, { bio });
      setProfileData((prev) => ({ ...prev, bio }));
      toast.success("Bio updated successfully!");
    } catch (error) {
      console.error("Error saving bio:", error);
      toast.error("Failed to save bio: " + error.message);
    }
  };
  
  const handleSaveSocials = async (socials) => {
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, { socials });
      setProfileData((prev) => ({ ...prev, socials }));
      toast.success("Social links updated successfully!");
    } catch (error) {
      console.error("Error saving socials:", error);
      toast.error("Failed to save social links: " + error.message);
    }
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUsername(data.username || "UnnamedUser");
            setTempUsername(data.username || "UnnamedUser");
            setProfileImage(data.profileImage || null);
            setProfileData({
              username: data.username || "UnnamedUser",
              profileImage: data.profileImage || null,
              bio: data.bio || "",
              socials: data.socials || {
                instagram: "",
                tiktok: "",
                twitter: "",
                facebook: "",
              },
            });
            setUserCurrency(data.currency || "USD");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to fetch user data: " + error.message);
        }
      }
    };
    fetchUserData();
    fetchAccounts();
  }, []);
  
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (
        !auth.currentUser ||
        !profileData.username ||
        profileData.username === "UnnamedUser" ||
        !profileData.profileImage ||
        !profileData.bio ||
        !Object.values(profileData.socials).some((val) => val.trim() !== "")
      ) {
        return;
      }
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          [`achievementStatuses.5.progress`]: 100,
          [`achievementStatuses.5.earned`]: true,
        });
        if (showAlfredAlert) {
          setShowAlfredPopup(true);
          setShowAlfredAlert(false);
        }
      } catch (error) {
        console.error("Error updating Alfred achievement:", error);
        toast.error("Failed to update achievement: " + error.message);
      }
    };
    checkProfileCompletion();
  }, [profileData, showAlfredAlert]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showAlfredPopup) {
        setShowAlfredPopup(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showAlfredPopup]);
  
  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      username={username}
      profileImage={profileImage}
      handleImageChange={handleImageChange}
      isEditingUsername={isEditingUsername}
      setIsEditingUsername={setIsEditingUsername}
      tempUsername={tempUsername}
      setTempUsername={setTempUsername}
      handleSaveUsername={handleSaveUsername}
      handleDiscardUsername={handleDiscardUsername}
      isUpdatingUsername={isUpdatingUsername}
    >
      {showAlfredPopup && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          ref={popupRef}
        >
          <div className="bg-[#161B22] p-6 rounded-xl border border-gray-800 max-w-sm w-full mx-4">
            <h3 className="text-white text-lg font-semibold mb-4">
              Achievement Unlocked!
            </h3>
            <p className="text-gray-300 mb-6">
              Congratulations! You've earned the "Alfred" achievement for completing your profile.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAlfredPopup(false)}
                className="px-4 py-2 bg-[#4426B9] text-white rounded-md hover:bg-[#2F1A7F] transition"
                aria-label="Close achievement popup"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
      {activeTab === "Uploads" && (
        <Uploads
          profileImage={profileImage}
          uploadedAccounts={uploadedAccounts}
          setUploadedAccounts={setUploadedAccounts}
          fetchAccounts={fetchAccounts}
          username={username}
          userCurrency={userCurrency}
        />
      )}
      {activeTab === "Bio" && <About handleSaveBio={handleSaveBio} />}
      {activeTab === "Socials" && (
        <Socials handleSaveSocials={handleSaveSocials} profileData={profileData} />
      )}
      {activeTab === "Achievements" && <Achievements userId={auth.currentUser?.uid} />}
    </Layout>
  );
  };
  
  UserProfile.propTypes = {
    // Define prop types if needed
  };
  
  export default UserProfile;