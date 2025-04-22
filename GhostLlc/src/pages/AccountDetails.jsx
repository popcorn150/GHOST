import "../App.css";
import { useParams, Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import BackButton from "../components/BackButton";
import { AdminIcon } from "../utils";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { BsCartPlusFill, BsFillCartCheckFill } from "react-icons/bs";
import { PiShoppingBagOpenFill, PiShoppingBagFill } from "react-icons/pi";
import { GiCancel } from "react-icons/gi";
import { Toaster, toast } from "sonner";
import { fetchAccountByIdWithImages } from "../utils/firebaseUtils";

const AccountDetails = () => {
  const { slug } = useParams();
  const [loadingImages, setLoadingImages] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isPurchased, setIsPurchased] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    const fetchAccountData = async () => {
      setLoading(true);
      console.log("Fetching account data for slug:", slug);

      // Note: Removed static account fetching for simplicity, assuming Firestore is primary
      let foundAccount = null;

      // Check Firestore
      const firestoreAccount = await fetchAccountByIdWithImages(slug);
      console.log("Fetched Firestore account:", firestoreAccount);

      if (firestoreAccount) {
        foundAccount = {
          id: firestoreAccount.id,
          title: firestoreAccount.accountName || "Untitled Account",
          img: firestoreAccount.accountImage || AdminIcon,
          details:
            firestoreAccount.accountDescription || "No details available",
          views: firestoreAccount.views || 0,
          accountWorth: firestoreAccount.accountWorth,
          accountCredential: firestoreAccount.accountCredential,
          createdAt: firestoreAccount.createdAt,
          username: firestoreAccount.username || "Ghost",
          userId: firestoreAccount.userId, // Added userId
          userProfilePic: firestoreAccount.userProfilePic || AdminIcon,
          screenShots: Array.isArray(firestoreAccount.screenshots)
            ? firestoreAccount.screenshots.map((url, index) => ({
                id: `screenshot-${index}`,
                img: url,
              }))
            : [],
          isFromFirestore: true,
        };
        console.log("Mapped Firestore account:", foundAccount);
      }

      console.log("Final mapped account:", foundAccount);
      setAccount(foundAccount);
      setLoading(false);
    };

    fetchAccountData();
  }, [slug]);

  useEffect(() => {
    const timer = setTimeout(() => setLoadingImages(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Reset credentials visibility when purchase status changes
  useEffect(() => {
    if (!isPurchased) {
      setShowCredentials(false);
    }
  }, [isPurchased]);

  const handleImageClick = (index) => setSelectedImage(index);

  const handleNext = () =>
    account?.screenShots?.length > 0 &&
    setSelectedImage((prev) => (prev + 1) % account.screenShots.length);

  const handlePrev = () => {
    account?.screenShots?.length > 0 &&
      setSelectedImage(
        (prev) =>
          (prev - 1 + account.screenShots.length) % account.screenShots.length
      );
  }

  const handleAddToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem("ghost_cart")) || [];

    const alreadyInCart = existingCart.some(
      (item) => (item.slug || item.id) === (account.slug || account.id)
    );
  
    if (
      alreadyInCart
    ) {
      toast.warning(`${account.title} is already in your cart!`);
    } else {
      const updatedCart = [...existingCart, account];
      localStorage.setItem("ghost_cart", JSON.stringify(updatedCart));
      setCart(updatedCart);
      toast.success(`${account.title} added to cart!`);

      console.log("🧃 Saved to localStorage:", updatedCart);
    }
  };

  const handlePurchase = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setIsPurchased(true);
          resolve();
        }, 2000);
      }),
      {
        loading: `Processing purchase for ${account.title}...`,
        success: `${account.title} purchased successfully!`,
        error: `Failed to purchase ${account.title}`,
      }
    );
  };

  const toggleCredentialVisibility = () => {
    if (isPurchased) {
      setShowCredentials(!showCredentials);
    } else {
      toast.error("You must purchase this account to view credentials");
    }
  };

  const renderCredentials = () => {
    if (!account.accountCredential) return null;

    return (
      <div className="mt-4 relative">
        <h3 className="text-lg font-semibold">Account Credentials</h3>
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
          {isPurchased && (
            <button
              onClick={toggleCredentialVisibility}
              className="ml-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-full"
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
          )}
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
      <>
        <NavBar />
        <div className="flex justify-center items-center h-screen bg-gray-900">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-l-4 border-r-4 border-t-[#4426B9] border-b-[#4426B9] border-l-transparent border-r-transparent"></div>
            <p className="text-white text-lg font-semibold">
              Loading Account...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!account) {
    return (
      <>
        <NavBar />
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
          <div className="text-center text-red-500 text-2xl mb-4">
            Account not found
          </div>
          <Link
            to="/categories" // Corrected to match App.jsx
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Return to Browse
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="p-5 min-h-screen text-white">
        <div className="px-4 mt-4">
          <BackButton />
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-7 mt-5">
          <div className="max-w-4xl">
            <div className="flex flex-col items-start md:items-start gap-4">
              <img
                src={account.img || AdminIcon}
                alt={account.title}
                className="w-[500px] h-[300px] object-cover rounded-md"
                onError={() =>
                  console.error(
                    `Failed to load main image for ${account.title}`
                  )
                }
              />
              <div>
                <h1 className="text-md md:text-xl font-bold">
                  {account.title}
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Uploaded by: {account.username || "Ghost"}
                </p>
                <span className="flex justify-between items-center mt-2">
                  <p className="text-gray-400 mr-44">
                    {account.views || 0} Total Views
                  </p>
                  <Link to={`/profilevisit/${account.userId}`}>
                    <img
                      src={
                        account.isFromFirestore
                          ? account.userProfilePic || AdminIcon
                          : AdminIcon
                      }
                      alt="User Profile"
                      className="w-8 md:w-10 h-8 md:h-10 rounded-full object-cover hover:cursor-pointer"
                      onError={() =>
                        console.error(
                          `Failed to load profile pic for ${account.username}`
                        )
                      }
                    />
                  </Link>
                </span>
              </div>
            </div>
          </div>

          <div className="w-auto md:w-[50%] h-auto border p-4 rounded-lg">
            <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-2">
              Details
            </h2>
            <p className="text-gray-300">{account.details}</p>
            {account.accountWorth && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-green-400">
                  Account Worth
                </h3>
                <p className="text-xl text-green-400">
                  ${account.accountWorth}
                </p>
              </div>
            )}
            {renderCredentials()}
          </div>
        </div>

        {account.screenShots?.length > 0 && (
          <div className="mt-6 border p-5 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-700">
              Screenshots
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 cursor-pointer">
              {loadingImages
                ? Array.from({ length: account.screenShots.length }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="relative w-full h-40 bg-gray-700 rounded-md flex items-center justify-center"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-l-2 border-r-2 border-t-[#4426B9] border-b-[#4426B9] border-l-transparent border-r-transparent"></div>
                          <p className="text-gray-400 text-sm">Loading...</p>
                        </div>
                      </div>
                    )
                  )
                : account.screenShots.map((shot, index) => (
                    <img
                      key={shot.id || `shot-${index}`}
                      src={shot.img}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-40 object-cover rounded-md"
                      onClick={() => handleImageClick(index)}
                      onError={() =>
                        console.error(`Failed to load screenshot ${index + 1}`)
                      }
                    />
                  ))}
            </div>
          </div>
        )}

        {account.createdAt && (
          <div className="mt-6">
            <p className="text-gray-400">
              Listed on{" "}
              {new Date(
                account.createdAt.seconds
                  ? account.createdAt.seconds * 1000
                  : account.createdAt
              ).toLocaleDateString()}
            </p>
          </div>
        )}

        {selectedImage !== null && account.screenShots?.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-5 right-5 text-white text-3xl cursor-pointer"
            >
              <GiCancel className="w-8 h-8 md:w-10 md:h-10" />
            </button>
            <button
              onClick={handlePrev}
              className="absolute left-5 text-white text-3xl cursor-pointer"
            >
              <FaArrowLeft className="w-8 h-8 md:w-10 md:h-10" />
            </button>
            <img
              src={account.screenShots[selectedImage].img}
              alt="Screenshot"
              className="max-w-[90%] max-h-[80vh] rounded-lg"
            />
            <button
              onClick={handleNext}
              className="absolute right-5 text-white text-3xl cursor-pointer"
            >
              <FaArrowRight className="w-8 h-8 md:w-10 md:h-10" />
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-end items-start md:items-center px-4 py-6 gap-4">
          <Toaster richColors position="top-center" />
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              className={`flex text-white px-4 py-2 gap-2 rounded-md transition cursor-pointer ${
                cart.some(
                  (item) =>
                    (item.slug || item.id) === (account.slug || account.id)
                )
                  ? "bg-[#4B5564] cursor-not-allowed"
                  : "bg-[#1C275E]"
              }`}
              disabled={cart.some(
                (item) => (item.slug || item.id) === (account.slug || item.id)
              )}
            >
              {cart.some(
                (item) =>
                  (item.slug || item.id) === (account.slug || account.id)
              ) ? (
                <>
                  <span className="text-gray-300">In Cart</span>
                  <BsFillCartCheckFill className="self-center" />
                </>
              ) : (
                <>
                  <span className="text-white">Add to Cart</span>
                  <BsCartPlusFill className="self-center" />
                </>
              )}
            </button>

            <button
              onClick={handlePurchase}
              className={`flex text-white px-4 py-2 gap-2 rounded-md transition cursor-pointer ${
                isPurchased ? "bg-[#A299C4] cursor-not-allowed" : "bg-[#4426B9]"
              }`}
              disabled={isPurchased}
            >
              {isPurchased ? (
                <>
                  <span className="text-gray-300">Purchased</span>
                  <PiShoppingBagOpenFill className="self-center" />
                </>
              ) : (
                <>
                  <span className="text-white">Purchase</span>
                  <PiShoppingBagFill className="self-center" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountDetails;
