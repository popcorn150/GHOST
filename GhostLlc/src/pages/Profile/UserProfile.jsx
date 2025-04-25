import { useState, useEffect, useRef } from "react";
import { auth, db } from "../../database/firebaseConfig";
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
  writeBatch,
} from "firebase/firestore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import BackButton from "../../components/BackButton";
import { Link } from "react-router-dom";
import { MdOutlineCameraEnhance } from "react-icons/md";
import { BsPencilSquare } from "react-icons/bs";
import {
  FaSave,
  FaTrashAlt,
  FaStar,
  FaInstagram,
  FaTiktok,
  FaImage,
  FaShareAlt,
  FaLink,
  FaWhatsapp,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { UploadCloud, User, Heart, Trophy } from "lucide-react";
import { FaSquareFacebook, FaXTwitter } from "react-icons/fa6";
import { IoAdd } from "react-icons/io5";
import { LuUpload } from "react-icons/lu";

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
  { name: "Socials", icon: Heart },
  { name: "Favorites", icon: Trophy },
];

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
  const [isProcessingProfileImage, setIsProcessingProfileImage] = useState(false);
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
      <div className="flex flex-col items-center justify-center p-2 bg-[#010409]">
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
        <div className="w-full px-4 sm:px-12 md:px-24 mx-auto">
          <div className="flex justify-between border-b relative">
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
                transform: `translateX(${tabs.findIndex((tab) => tab.name === activeTab) * 100}%)`,
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
  const minScreenshots = 3;
  const maxScreenshots = 5;
  const maxDescriptionWords = 100;
  const accountImageInputRef = useRef(null);
  const screenshotInputRef = useRef(null);
  const shareModalRef = useRef(null);
  const navigate = useNavigate();

  const formatNumberWithCommas = (value) => {
    if (!value) return "";
    const cleanedValue = value.replace(/[^0-9.]/g, "");
    const parts = cleanedValue.split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const decimalPart = parts.length > 1 ? `.${parts[1]}` : "";
    return integerPart + decimalPart;
  };

  const handleAccountWorthChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    setAccountWorth(rawValue);
  };

  useEffect(() => {
    if (editingAccount && editingAccount.accountWorth) {
      setAccountWorth(editingAccount.accountWorth.toString());
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
        )}"e=${encodeURIComponent(text)}`;
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
                    <span className="text-[#0576FF] font-light uppercase text-xs">
                      Credential:
                    </span>{" "}
                    <span className="font-medium break-all">
                      {acc.accountCredential}
                    </span>
                  </p>
                  <p className="text-gray-200 text-xs sm:text-sm tracking-wider leading-relaxed">
                    <span className="text-[#0576FF] font-light uppercase text-xs">
                      Worth:
                    </span>{" "}
                    <span className="font-medium">
                      {formatNumberWithCommas(acc.accountWorth.toString())} (
                      {acc.currency || userCurrency})
                    </span>
                  </p>
                  <p className="text-gray-200 text-xs sm:text-sm tracking-wider leading-relaxed line-clamp-2">
                    <span className="text-[#0576FF] font-light uppercase text-xs">
                      Description:
                    </span>{" "}
                    <span className="font-light">{acc.accountDescription}</span>
                  </p>
                </div>

                {acc.images &&
                Object.keys(acc.images).filter((key) =>
                  key.startsWith("screenshot")
                ).length > 0 ? (
                  <div className="mb-4">
                    <p className="text-gray-200 text-xs sm:text-sm font-light uppercase tracking-wider mb-4">
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
                  <p className="text-gray-400 text-xs sm:text-sm font-light tracking-wider mb-4">
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

    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          bio: tempText,
        });
        await handleSaveBio(tempText);
        toast.success("Bio updated successfully!");
      } catch (error) {
        console.error("Error saving bio:", error);
        toast.error("Failed to save bio: " + error.message);
      }
    }
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
  const [showAlert, setShowAlert] = useState(true);
  const navigate = useNavigate();

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

  const getProgressIndicators = () => {
    const indicators = [
      {
        label: "Username",
        completed: !!profileData.username && profileData.username !== "UnnamedUser",
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
        completed: Object.values(socialLinks).some((val) => val && val.trim() !== ""),
      },
    ];
    return indicators;
  };

  const isAlfredEarned = getProgressIndicators().every((indicator) => indicator.completed);

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
        }
      }
    };
    fetchSocials();
  }, []);

  return (
    <div className="mt-16 mb-20 p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 xl:p-10 bg-gradient-to-br from-[#0E1115] via-[#1A1F29] to-[#252A36] rounded-2xl border border-gray-800">
      <h2 className="text-gray-100 text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl font-semibold tracking-wider mb-10 sm:mb-12 lg:mb-14">
        Socials
      </h2>
      {showAlert && (
        <div className="mb-6 p-4 bg-[#1A1F29] border border-[#0576FF] rounded-md flex justify-between items-center">
          <div>
            <p className="text-white font-semibold">Alfred Achievement Progress</p>
            <p className="text-gray-300 text-sm">
              Complete your profile to earn the Alfred achievement!
            </p>
          </div>
          <button
            onClick={() => setShowAlert(false)}
            className="text-gray-400 hover:text-white transition"
            aria-label="Dismiss alert"
          >
            <FaTimesCircle className="w-5 h-5" />
          </button>
        </div>
      )}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4">
          {getProgressIndicators().map((indicator, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-gray-300"
            >
              {indicator.completed ? (
                <FaCheckCircle className="text-green-500 w-4 h-4" />
              ) : (
                <FaTimesCircle className="text-red-500 w-4 h-4" />
              )}
              <span>{indicator.label}</span>
            </div>
          ))}
        </div>
      </div>
      {isEditing ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <FaInstagram className="text-pink-500 w-6 h-6" />
              <input
                type="text"
                placeholder="Instagram handle"
                value={tempLinks.instagram}
                onChange={(e) => handleChange("instagram", e.target.value)}
                className="w-full p-3 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0576FF] text-sm"
                aria-label="Instagram handle"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaTiktok className="text-white w-6 h-6" />
              <input
                type="text"
                placeholder="TikTok handle"
                value={tempLinks.tiktok}
                onChange={(e) => handleChange("tiktok", e.target.value)}
                className="w-full p-3 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0576FF] text-sm"
                aria-label="TikTok handle"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaXTwitter className="text-blue-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Twitter handle"
                value={tempLinks.twitter}
                onChange={(e) => handleChange("twitter", e.target.value)}
                className="w-full p-3 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0576FF] text-sm"
                aria-label="Twitter handle"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaSquareFacebook className="text-blue-600 w-6 h-6" />
              <input
                type="text"
                placeholder="Facebook handle"
                value={tempLinks.facebook}
                onChange={(e) => handleChange("facebook", e.target.value)}
                className="w-full p-3 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0576FF] text-sm"
                aria-label="Facebook handle"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleDiscard}
              className="flex items-center gap-2 bg-[#EB3223] text-white px-4 py-2 rounded-md hover:bg-[#B71C1C] transition"
              aria-label="Discard socials changes"
            >
              <FaTrashAlt className="w-4 h-4" /> Discard
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#4426B9] text-white px-4 py-2 rounded-md hover:bg-[#2F1A7F] transition"
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
                className="flex items-center gap-2 text-gray-300 hover:text-pink-500 transition"
              >
                <FaInstagram className="w-6 h-6" />
                <span>{socialLinks.instagram}</span>
              </a>
            )}
            {socialLinks.tiktok && (
              <a
                href={`https://tiktok.com/@${socialLinks.tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition"
              >
                <FaTiktok className="w-6 h-6" />
                <span>{socialLinks.tiktok}</span>
              </a>
            )}
            {socialLinks.twitter && (
              <a
                href={`https://twitter.com/${socialLinks.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition"
              >
                <FaXTwitter className="w-6 h-6" />
                <span>{socialLinks.twitter}</span>
              </a>
            )}
            {socialLinks.facebook && (
              <a
                href={`https://facebook.com/${socialLinks.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-300 hover:text-blue-600 transition"
              >
                <FaSquareFacebook className="w-6 h-6" />
                <span>{socialLinks.facebook}</span>
              </a>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-[#0576FF] text-white px-4 py-2 rounded-md hover:bg-[#045FCC] transition"
              aria-label="Edit socials"
            >
              <BsPencilSquare className="w-4 h-4" /> Edit Socials
            </button>
            {isAlfredEarned && (
              <button
                onClick={() => navigate("/achievements")}
                className="flex items-center gap-2 bg-[#4426B9] text-white px-4 py-2 rounded-md hover:bg-[#2F1A7F] transition"
                aria-label="View Achievements"
              >
                <FaStar className="w-4 h-4" /> View Achievements
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Favorites = ({ favoriteAccounts, setFavoriteAccounts, userCurrency }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleToggleFavorite = async (account) => {
    if (!auth.currentUser) {
      toast.error("Please log in to manage favorites.");
      return;
    }

    setIsProcessing(true);
    try {
      const favoriteRef = doc(
        db,
        `users/${auth.currentUser.uid}/favorites`,
        account.id
      );
      const isFavorited = favoriteAccounts.some((fav) => fav.id === account.id);

      if (isFavorited) {
        await deleteDoc(favoriteRef);
        setFavoriteAccounts(
          favoriteAccounts.filter((fav) => fav.id !== account.id)
        );
        toast.success(`${account.accountName} removed from favorites!`);
      } else {
        await setDoc(favoriteRef, {
          accountId: account.id,
          accountName: account.accountName,
          addedAt: new Date(),
        });
        setFavoriteAccounts([...favoriteAccounts, account]);
        toast.success(`${account.accountName} added to favorites!`);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-5">
      {isProcessing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-l-4 border-r-4 border-t-[#0576FF] border-b-[#0576FF] border-l-transparent border-r-transparent"></div>
            <p className="text-white text-lg font-semibold">Processing...</p>
          </div>
        </div>
      )}
      <h2 className="text-gray-100 text-2xl font-semibold tracking-wider mb-6">
        Favorite Accounts
      </h2>
      {favoriteAccounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteAccounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-[#161B22]/80 p-4 rounded-xl shadow-lg border border-gray-800"
            >
              <div className="flex items-center mb-4">
                <img
                  src={acc.images?.accountImage || "/default-profile.png"}
                  alt={acc.accountName}
                  className="w-10 h-10 rounded-full border-2 border-[#0576FF]/60 mr-3 object-cover"
                />
                <div>
                  <h3 className="text-gray-100 text-lg font-medium tracking-wider">
                    {acc.accountName}
                  </h3>
                  <p className="text-gray-400 text-sm tracking-wider">
                    <span className="text-[#0576FF] font-light uppercase">
                      Uploaded by:
                    </span>{" "}
                    {acc.username || "Unknown"}
                  </p>
                </div>
              </div>
              {acc.images?.accountImage && (
                <img
                  src={acc.images.accountImage}
                  alt={acc.accountName}
                  className="w-full h-44 object-cover rounded-lg mb-4"
                  style={{ aspectRatio: "16/9" }}
                />
              )}
              <div className="space-y-2 mb-4">
                <p className="text-gray-200 text-sm tracking-wider">
                  <span className="text-[#0576FF] font-light uppercase">
                    Credential:
                  </span>{" "}
                  <span className="font-medium">{acc.accountCredential}</span>
                </p>
                <p className="text-gray-200 text-sm tracking-wider">
                  <span className="text-[#0576FF] font-light uppercase">
                    Worth:
                  </span>{" "}
                  <span className="font-medium">
                    {acc.accountWorth} ({acc.currency || userCurrency})
                  </span>
                </p>
                <p className="text-gray-200 text-sm tracking-wider line-clamp-2">
                  <span className="text-[#0576FF] font-light uppercase">
                    Description:
                  </span>{" "}
                  <span className="font-light">{acc.accountDescription}</span>
                </p>
              </div>
              <button
                onClick={() => handleToggleFavorite(acc)}
                className="flex items-center justify-center bg-[#EB3223]/80 text-white p-2 rounded-full hover:bg-[#EB3223] transition w-9 h-9"
                aria-label={`Remove ${acc.accountName} from favorites`}
              >
                <FaStar className="w-5 h-5 text-yellow-400" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <FaStar className="text-gray-400 text-4xl mb-4" />
          <p className="text-gray-400 text-center">
            You haven't added any accounts to your favorites yet.
          </p>
          <button
            onClick={() => navigate("/achievements")}
            className="m-5 p-5 bg-blue-500 text-white rounded-full"
          >
            Achievements
          </button>
        </div>
      )}
    </div>
  );
};

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("Uploads");
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [uploadedAccounts, setUploadedAccounts] = useState([]);
  const [favoriteAccounts, setFavoriteAccounts] = useState([]);
  const [userCurrency, setUserCurrency] = useState("USD");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [showAlfredAlert, setShowAlfredAlert] = useState(false);
  const [bio, setBio] = useState("");
  const [socials, setSocials] = useState({
    instagram: "",
    tiktok: "",
    twitter: "",
    facebook: "",
  });

  const navigate = useNavigate();

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

  const checkProfileCompletion = async (userData) => {
    try {
      const userId = auth.currentUser.uid;
      const userDocRef = doc(db, "users", userId);
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
      const earned = completedFields === 4;

      await updateDoc(userDocRef, {
        [`achievementStatuses.5.progress`]: progress,
        [`achievementStatuses.5.earned`]: earned,
      });

      if (earned && !userData.achievementStatuses?.[5]?.earned) {
        setShowAlfredAlert(true);
        toast.success("Congratulations! You've earned the Alfred achievement!");
      }
    } catch (err) {
      console.error("Error updating profile completion:", err);
      toast.error("Failed to update profile completion.");
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file && auth.currentUser) {
      try {
        const compressedImage = await compressImage(file);
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          profileImage: compressedImage,
        });
        setProfileImage(compressedImage);
        const userDoc = await getDoc(userDocRef);
        await checkProfileCompletion({
          ...userDoc.data(),
          profileImage: compressedImage,
          bio,
          socials,
        });
        toast.success("Profile image updated successfully!");
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image: " + error.message);
      }
    }
  };

  const handleSaveUsername = async () => {
    if (!auth.currentUser || !tempUsername.trim()) {
      toast.error("Username cannot be empty.");
      return;
    }

    setIsUpdatingUsername(true);
    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        username: tempUsername.trim(),
      });

      const accountsQuery = query(
        collection(db, "accounts"),
        where("userId", "==", auth.currentUser.uid)
      );
      const accountsSnapshot = await getDocs(accountsQuery);
      const batch = writeBatch(db);
      accountsSnapshot.forEach((doc) => {
        batch.update(doc.ref, { username: tempUsername.trim() });
      });
      await batch.commit();

      setUsername(tempUsername.trim());
      setIsEditingUsername(false);
      await checkProfileCompletion({
        username: tempUsername.trim(),
        profileImage,
        bio,
        socials,
      });
      toast.success("Username updated successfully!");
    } catch (error) {
      console.error("Error saving username:", error);
      toast.error("Failed to save username: " + error.message);
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleSaveBio = async (newBio) => {
    setBio(newBio);
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await checkProfileCompletion({
        username,
        profileImage,
        bio: newBio,
        socials,
      });
    }
  };

  const handleSaveSocials = async (newSocials) => {
    setSocials(newSocials);
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          socials: newSocials,
        });
        await checkProfileCompletion({
          username,
          profileImage,
          bio,
          socials: newSocials,
        });
        toast.success("Social links updated successfully!");
      } catch (error) {
        console.error("Error saving social links:", error);
        toast.error("Failed to save social links: " + error.message);
      }
    }
  };

  const handleDiscardUsername = () => {
    setTempUsername(username);
    setIsEditingUsername(false);
  };

  const fetchAccounts = async () => {
    if (auth.currentUser) {
      try {
        const accountsQuery = query(
          collection(db, "accounts"),
          where("userId", "==", auth.currentUser.uid)
        );
        const accountsSnapshot = await getDocs(accountsQuery);
        const accountsData = await Promise.all(
          accountsSnapshot.docs.map(async (accountDoc) => {
            const imagesRef = collection(
              db,
              `accounts/${accountDoc.id}/images`
            );
            const imagesSnapshot = await getDocs(imagesRef);
            const images = {};
            imagesSnapshot.forEach((imgDoc) => {
              images[imgDoc.id] = imgDoc.data().image;
            });
            return {
              id: accountDoc.id,
              ...accountDoc.data(),
              images,
            };
          })
        );
        setUploadedAccounts(accountsData);
      } catch (error) {
        console.error("Error fetching accounts:", error);
        toast.error("Failed to fetch accounts: " + error.message);
      }
    }
  };

  const fetchFavorites = async () => {
    if (auth.currentUser) {
      try {
        const favoritesRef = collection(
          db,
          `users/${auth.currentUser.uid}/favorites`
        );
        const favoritesSnapshot = await getDocs(favoritesRef);
        const favoriteIds = favoritesSnapshot.docs.map(
          (doc) => doc.data().accountId
        );

        const favoriteAccountsData = await Promise.all(
          favoriteIds.map(async (accountId) => {
            const accountDocRef = doc(db, "accounts", accountId);
            const accountDoc = await getDoc(accountDocRef);
            if (accountDoc.exists()) {
              const imagesRef = collection(db, `accounts/${accountId}/images`);
              const imagesSnapshot = await getDocs(imagesRef);
              const images = {};
              imagesSnapshot.forEach((imgDoc) => {
                images[imgDoc.id] = imgDoc.data().image;
              });
              return {
                id: accountDoc.id,
                ...accountDoc.data(),
                images,
              };
            }
            return null;
          })
        );

        setFavoriteAccounts(favoriteAccountsData.filter((acc) => acc !== null));
      } catch (error) {
        console.error("Error fetching favorites:", error);
        toast.error("Failed to fetch favorites: " + error.message);
      }
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.username || "UnnamedUser");
            setTempUsername(userData.username || "UnnamedUser");
            setProfileImage(userData.profileImage || null);
            setUserCurrency(userData.currency || "USD");
            setBio(userData.bio || "");
            setSocials(
              userData.socials || {
                instagram: "",
                tiktok: "",
                twitter: "",
                facebook: "",
              }
            );
            await checkProfileCompletion(userData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to fetch user data: " + error.message);
        }
      }
    };

    fetchUserData();
    fetchAccounts();
    fetchFavorites();
  }, []);

  return (
    <>
      {showAlfredAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-[#161B22] p-6 rounded-xl border border-gray-800 max-w-sm w-full mx-4">
            <h3 className="text-white text-lg font-semibold mb-4">
              Achievement Unlocked: Alfred!
            </h3>
            <p className="text-gray-300 mb-6">
              Congratulations! You've completed your profile by adding a
              username, profile image, bio, and social links.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAlfredAlert(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                aria-label="Dismiss Alfred achievement alert"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
          <Socials
            handleSaveSocials={handleSaveSocials}
            profileData={{ username, profileImage, bio, socials }}
          />
        )}
        {activeTab === "Favorites" && (
          <Favorites
            favoriteAccounts={favoriteAccounts}
            setFavoriteAccounts={setFavoriteAccounts}
            userCurrency={userCurrency}
          />
        )}
      </Layout>
    </>
  );
};

export default UserProfile;