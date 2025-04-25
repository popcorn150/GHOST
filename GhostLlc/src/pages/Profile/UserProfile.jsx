import BackButton from "../../components/BackButton";
import NavBar from "./NavBar";
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
} from "react-icons/fa";
import { UploadCloud, User, Heart, Trophy } from "lucide-react";
import { FaSquareFacebook, FaXTwitter } from "react-icons/fa6";
import { IoAdd } from "react-icons/io5";
import { LuUpload } from "react-icons/lu";
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

let imageCompression;
import("browser-image-compression").then((mod) => {
  imageCompression = mod.default;
});

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
                  className={`py-2 flex-1 text-center cursor-pointer flex items-center justify-center gap-1 ${activeTab === tab.name
                      ? "text-white font-semibold"
                      : "text-gray-400"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm">{tab.name}</span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full h-1 bg-[#0E1115] border-none">
            <div
              className="h-full bg-purple-500 transition-all duration-   duration-300"
              style={{
                width: "20%",
                transform: `translateX(${tabs.findIndex((tab) => tab.name === activeTab) * 135
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
  const minScreenshots = 3;
  const maxScreenshots = 5;
  const maxDescriptionWords = 100;
  const accountImageInputRef = useRef(null);
  const screenshotInputRef = useRef(null);
  const shareModalRef = useRef(null);

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
    setAccountWorth(account.accountWorth);
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

    try {
      setIsProcessing(true);
      const accountDocRef = doc(db, "accounts", editingAccount.id);
      await updateDoc(accountDocRef, {
        accountName,
        accountCredential,
        accountWorth,
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
    const shareUrl = `${window.location.origin}/account/${account.id}`;
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
    const shareUrl = `${window.location.origin}/account/${account.id}`;
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

      try {
        setIsProcessing(true);
        const userId = auth.currentUser.uid;
        const uploadData = {
          userId,
          username,
          accountName,
          accountCredential,
          accountWorth,
          accountDescription,
          category: accountCategory,
          createdAt: new Date(),
          currency: userCurrency,
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

  // Handle Escape key to close share modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showShareModal) {
        setShowShareModal(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showShareModal]);

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
                  type="number"
                  placeholder={`Account's Worth (in ${userCurrency})`}
                  value={accountWorth}
                  onChange={(e) => setAccountWorth(e.target.value)}
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
                  <option value="Shooter">Shooter</option>
                  <option value="Action">Action</option>
                  <option value="Racing">Racing</option>
                  <option value="Sports">Sports</option>
                  <option value="Fighting">Fighting</option>
                  <option value="User Uploads">User Uploads</option>
                  <option value="Other">Other</option>
                </select>
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
                    src={src || null}
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
                className="w-full min-w-[240px] bg-[#161B22]/80 p-4 rounded-xl shadow-lg border border-gray-800 active:scale-95 transition-all duration-300 group"
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
                      {acc.accountWorth} ({acc.currency || userCurrency})
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
                    onClick={() => handleShare(acc)}
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
                      onClick={() => handleEdit(acc)}
                      className="flex items-center justify-center bg-[#4426B9]/80 text-white p-1.5 sm:p-2 rounded-full hover:bg-[#4426B9] active:bg-[#2F1A7F] transition-all duration-300 w-8 h-8 sm:w-9 sm:h-9"
                      aria-label={`Edit account ${acc.accountName}`}
                    >
                      <BsPencilSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(acc)}
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

const About = () => {
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
            className="flex items-center gap-2 border-2 border-[#0576FF] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[#0576FF]/20 transition"
            aria-label="Edit bio"
          >
            <BsPencilSquare /> Edit
          </button>
        )}
      </div>
    </div>
  );
};

const Socials = () => {
  const [socials, setSocials] = useState({
    facebook: "",
    instagram: "",
    tiktok: "",
    twitter: "",
  });
  const [tempSocials, setTempSocials] = useState({ ...socials });
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => setIsEditing(true);

  const handleDiscard = () => {
    setTempSocials({ ...socials });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSocials({ ...tempSocials });
    setIsEditing(false);

    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          socials: tempSocials,
        });
        toast.success("Social media links updated successfully!");
      } catch (error) {
        console.error("Error saving socials:", error);
        toast.error("Failed to save social media links: " + error.message);
      }
    }
  };

  useEffect(() => {
    const fetchSocials = async () => {
      if (auth.currentUser) {
        try {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().socials) {
            setSocials(userDoc.data().socials);
            setTempSocials(userDoc.data().socials);
          }
        } catch (error) {
          console.error("Error fetching socials:", error);
        }
      }
    };
    fetchSocials();
  }, []);

  return (
    <div className="p-5">
      <div className="mb-4">
        <label className="block text-gray-300 mb-2" htmlFor="facebook-input">
          Facebook
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 bg-[#1A1F29] border border-r-0 border-gray-600 rounded-l-md">
            <FaSquareFacebook className="text-blue-500" />
          </span>
          <input
            id="facebook-input"
            type="text"
            value={tempSocials.facebook}
            onChange={(e) =>
              setTempSocials({ ...tempSocials, facebook: e.target.value })
            }
            className="flex-1 px-3 py-2 border border-gray-600 rounded-r-md bg-[#0E1115] text-white focus:outline-none focus:ring-2 focus:ring-[#0576FF]"
            placeholder="Your Facebook profile URL"
            readOnly={!isEditing}
            aria-label="Facebook profile URL"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2" htmlFor="instagram-input">
          Instagram
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 bg-[#1A1F29] border border-r-0 border-gray-600 rounded-l-md">
            <FaInstagram className="text-pink-500" />
          </span>
          <input
            id="instagram-input"
            type="text"
            value={tempSocials.instagram}
            onChange={(e) =>
              setTempSocials({ ...tempSocials, instagram: e.target.value })
            }
            className="flex-1 px-3 py-2 border border-gray-600 rounded-r-md bg-[#0E1115] text-white focus:outline-none focus:ring-2 focus:ring-[#0576FF]"
            placeholder="Your Instagram profile URL"
            readOnly={!isEditing}
            aria-label="Instagram profile URL"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2" htmlFor="tiktok-input">
          TikTok
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 bg-[#1A1F29] border border-r-0 border-gray-600 rounded-l-md">
            <FaTiktok className="text-gray-200" />
          </span>
          <input
            id="tiktok-input"
            type="text"
            value={tempSocials.tiktok}
            onChange={(e) =>
              setTempSocials({ ...tempSocials, tiktok: e.target.value })
            }
            className="flex-1 px-3 py-2 border border-gray-600 rounded-r-md bg-[#0E1115] text-white focus:outline-none focus:ring-2 focus:ring-[#0576FF]"
            placeholder="Your TikTok profile URL"
            readOnly={!isEditing}
            aria-label="TikTok profile URL"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2" htmlFor="twitter-input">
          Twitter
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 bg-[#1A1F29] border border-r-0 border-gray-600 rounded-l-md">
            <FaXTwitter className="text-gray-200" />
          </span>
          <input
            id="twitter-input"
            type="text"
            value={tempSocials.twitter}
            onChange={(e) =>
              setTempSocials({ ...tempSocials, twitter: e.target.value })
            }
            className="flex-1 px-3 py-2 border border-gray-600 rounded-r-md bg-[#0E1115] text-white focus:outline-none focus:ring-2 focus:ring-[#0576FF]"
            placeholder="Your Twitter profile URL"
            readOnly={!isEditing}
            aria-label="Twitter profile URL"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-3">
        {isEditing ? (
          <>
            <button
              onClick={handleDiscard}
              className="flex items-center gap-2 bg-[#EB3223] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[#B71C1C] transition"
              aria-label="Discard social media changes"
            >
              <FaTrashAlt /> Discard
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#4426B9] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[#2F1A7F] transition"
              aria-label="Save social media links"
            >
              <FaSave /> Save
            </button>
          </>
        ) : (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 border-2 border-[#0576FF] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[#0576FF]/20 transition"
            aria-label="Edit social media links"
          >
            <BsPencilSquare /> Edit
          </button>
        )}
      </div>
    </div>
  );
};

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (auth.currentUser) {
        try {
          setIsLoading(true);
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data().favorites) {
            const favoritesIds = userDoc.data().favorites;
            const favoritesData = [];

            for (const id of favoritesIds) {
              const accountDocRef = doc(db, "accounts", id);
              const accountDoc = await getDoc(accountDocRef);

              if (accountDoc.exists()) {
                const imagesRef = collection(db, `accounts/${id}/images`);
                const imagesSnap = await getDocs(imagesRef);
                const images = {};

                imagesSnap.forEach((imgDoc) => {
                  images[imgDoc.id] = imgDoc.data().image || null;
                });

                favoritesData.push({
                  id,
                  ...accountDoc.data(),
                  images,
                });
              }
            }

            setFavorites(favoritesData);
          }
        } catch (error) {
          console.error("Error fetching favorites:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchFavorites();
  }, []);

  const removeFavorite = async (accountId) => {
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().favorites) {
          const currentFavorites = userDoc.data().favorites;
          const updatedFavorites = currentFavorites.filter(
            (id) => id !== accountId
          );

          await updateDoc(userDocRef, {
            favorites: updatedFavorites,
          });

          setFavorites(favorites.filter((fav) => fav.id !== accountId));
          toast.success("Account removed from favorites!");
        }
      } catch (error) {
        console.error("Error removing favorite:", error);
        toast.error("Failed to remove favorite: " + error.message);
      } finally {
        setShowDeleteConfirm(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-l-4 border-r-4 border-t-[#0576FF] border-b-[#0576FF] border-l-transparent border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-5">
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-[#161B22] p-6 rounded-xl border border-gray-800 max-w-sm w-full mx-4">
            <h3 className="text-white text-lg font-semibold mb-4">
              Confirm Removal
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to remove the account "
              {showDeleteConfirm.accountName}" from your favorites?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                aria-label="Cancel removal"
              >
                Cancel
              </button>
              <button
                onClick={() => removeFavorite(showDeleteConfirm.id)}
                className="px-4 py-2 bg-[#EB3223] text-white rounded-md hover:bg-[#B71C1C] transition"
                aria-label="Confirm removal"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      <h2 className="text-white text-xl font-semibold mb-6">
        Your Favorite Accounts
      </h2>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="bg-[#161B22] p-4 rounded-xl border border-gray-800 relative"
            >
              <div className="flex items-center mb-4">
                <div className="flex-1">
                  <h3 className="text-gray-100 text-lg font-medium truncate">
                    {favorite.accountName}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    <span className="text-[#0576FF]">By:</span>{" "}
                    {favorite.username || "Unknown"}
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(favorite)}
                  className="flex items-center justify-center bg-[#EB3223]/80 text-white p-1.5 sm:p-2 rounded-full hover:bg-[#EB3223] active:bg-[#B71C1C] transition-all duration-300 w-8 h-8 sm:w-9 sm:h-9"
                  aria-label={`Remove ${favorite.accountName} from favorites`}
                >
                  <FaStar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {favorite.images?.accountImage ? (
                <div className="mb-4">
                  <img
                    src={favorite.images.accountImage}
                    alt={favorite.accountName}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-gray-800 flex items-center justify-center rounded-lg mb-4">
                  <FaImage className="text-gray-500 w-8 h-8" />
                </div>
              )}

              <div className="space-y-2">
                <p className="text-gray-200 text-sm">
                  <span className="text-[#0576FF] font-light uppercase text-xs">
                    Credential:
                  </span>{" "}
                  <span className="font-medium">
                    {favorite.accountCredential}
                  </span>
                </p>
                <p className="text-gray-200 text-sm">
                  <span className="text-[#0576FF] font-light uppercase text-xs">
                    Worth:
                  </span>{" "}
                  <span className="font-medium">
                    {favorite.accountWorth} ({favorite.currency || "USD"})
                  </span>
                </p>
                <p className="text-gray-200 text-xs line-clamp-2">
                  <span className="text-[#0576FF] font-light uppercase text-xs">
                    Description:
                  </span>{" "}
                  {favorite.accountDescription}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <FaStar className="text-gray-400 text-4xl mb-4" />
          <p className="text-gray-400 text-center">
            You haven't added any accounts to your favorites yet.
          </p>

          <Link to='/achievements'>
            <button className="m-5 p-5 bg-blue-500 text-white rounded-full">
              Achievements
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("Uploads");
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [uploadedAccounts, setUploadedAccounts] = useState([]);
  const [userCurrency, setUserCurrency] = useState("USD");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  const fetchAccounts = async () => {
    if (auth.currentUser) {
      try {
        const q = query(
          collection(db, "accounts"),
          where("userId", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const accounts = [];
        for (const docSnap of querySnapshot.docs) {
          const accountData = { id: docSnap.id, ...docSnap.data() };
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
        setUploadedAccounts(accounts);
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setUploadedAccounts([]);
      }
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            if (userDocSnap.data().username) {
              setUsername(userDocSnap.data().username);
              setTempUsername(userDocSnap.data().username);
            } else {
              setUsername(auth.currentUser.displayName || "User");
              setTempUsername(auth.currentUser.displayName || "User");
              await setDoc(
                userDocRef,
                { username: auth.currentUser.displayName || "User" },
                { merge: true }
              );
            }

            if (userDocSnap.data().profileImage) {
              setProfileImage(userDocSnap.data().profileImage);
            }

            if (userDocSnap.data().currency) {
              setUserCurrency(userDocSnap.data().currency);
            } else {
              const response = await fetch("https://ipapi.co/json/");
              const data = await response.json();
              if (data.currency) {
                setUserCurrency(data.currency);
                await setDoc(
                  userDocRef,
                  { currency: data.currency },
                  { merge: true }
                );
              }
            }
          } else {
            setUsername(auth.currentUser.displayName || "User");
            setTempUsername(auth.currentUser.displayName || "User");
            await setDoc(
              userDocRef,
              { username: auth.currentUser.displayName || "User" },
              { merge: true }
            );
          }

          fetchAccounts();
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUsername(auth.currentUser.displayName || "User");
          setTempUsername(auth.currentUser.displayName || "User");
        }
      }
    };

    fetchUserData();
  }, []);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 400,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();

        return new Promise((resolve) => {
          reader.onloadend = async () => {
            const imageBase64 = reader.result;
            setProfileImage(imageBase64);

            if (auth.currentUser) {
              try {
                const userDocRef = doc(db, "users", auth.currentUser.uid);
                await updateDoc(userDocRef, {
                  profileImage: imageBase64,
                });
                toast.success("Profile image updated successfully!");
              } catch (error) {
                console.error("Error saving profile image:", error);
                toast.error("Failed to save profile image. Please try again.");
              }
            }
            resolve();
          };

          reader.readAsDataURL(compressedFile);
        });
      } catch (error) {
        console.error("Error processing image:", error);
        toast.error("Failed to process image. Please try again.");
      }
    }
  };

  const handleSaveUsername = async () => {
    if (!tempUsername.trim()) {
      toast.error("Username cannot be empty.");
      return;
    }

    setIsUpdatingUsername(true);
    try {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const newUsername = tempUsername.trim();

        await updateDoc(userDocRef, {
          username: newUsername,
        });

        const q = query(
          collection(db, "accounts"),
          where("userId", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);

        querySnapshot.forEach((docSnap) => {
          const accountRef = doc(db, "accounts", docSnap.id);
          batch.update(accountRef, { username: newUsername });
        });

        await batch.commit();

        setUsername(newUsername);
        setIsEditingUsername(false);
        fetchAccounts();
        toast.success("Username updated successfully!");
      }
    } catch (error) {
      console.error("Error saving username:", error);
      toast.error("Failed to save username. Please try again.");
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleDiscardUsername = () => {
    setTempUsername(username);
    setIsEditingUsername(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Uploads":
        return (
          <Uploads
            profileImage={profileImage}
            uploadedAccounts={uploadedAccounts}
            setUploadedAccounts={setUploadedAccounts}
            fetchAccounts={fetchAccounts}
            username={username}
            userCurrency={userCurrency}
          />
        );
      case "Bio":
        return <About />;
      case "Socials":
        return <Socials />;
      case "Favorites":
        return <Favorites />;
      default:
        return (
          <Uploads
            profileImage={profileImage}
            uploadedAccounts={uploadedAccounts}
            setUploadedAccounts={setUploadedAccounts}
            fetchAccounts={fetchAccounts}
            username={username}
            userCurrency={userCurrency}
          />
        );
    }
  };

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
      {renderTabContent()}
    </Layout>
  );
};

export default UserProfile;
