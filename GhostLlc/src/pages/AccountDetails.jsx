import "../App.css";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import availableAccounts from "../constants";
import categoryAccounts from "../constants/category";
import NavBar from "../components/NavBar";
import { AdminIcon } from "../utils";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { BsCartPlusFill } from "react-icons/bs";
import { BsFillCartCheckFill } from "react-icons/bs";
import { PiShoppingBagOpenFill } from "react-icons/pi";
import { PiShoppingBagFill } from "react-icons/pi";
import { GiCancel } from "react-icons/gi";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../database/firebaseConfig";
import { useCart } from '../context/CartContext';
import BackButton from "../components/BackButton";
import { Toaster, toast } from 'sonner';

const AccountDetails = () => {
  const { slug } = useParams();
  const [loadingImages, setLoadingImages] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isPurchased, setIsPurchased] = useState(false);
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    const fetchAccountData = async () => {
      setLoading(true);
      console.log("Fetching account data for slug:", slug);

      // Check static accounts first
      let foundAccount = availableAccounts.find((acc) => acc.slug === slug);
      if (!foundAccount) {
        for (const category of categoryAccounts) {
          const foundGame = category.games.find((game) => game.slug === slug);
          if (foundGame) {
            foundAccount = foundGame;
            break;
          }
        }
      }

      // Check Firestore if not found in static data
      if (!foundAccount) {
        try {
          const accountsRef = collection(db, "accounts");
          const querySnapshot = await getDocs(accountsRef);
          const accounts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("All Firestore accounts:", accounts);

          const firestoreAccount = accounts.find(
            (acc) =>
              acc.id === slug ||
              (acc.accountName &&
                acc.accountName.replace(/\s+/g, "-").toLowerCase() === slug)
          );
          console.log("Matched Firestore account:", firestoreAccount);

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
              screenShots: Array.isArray(firestoreAccount.screenshots)
                ? firestoreAccount.screenshots.map((url, index) => ({
                  id: `screenshot-${index}`,
                  img: url,
                }))
                : [],
            };
            console.log(
              "Mapped Firestore account with username:",
              foundAccount
            );
          } else {
            console.log("No Firestore account matched the slug:", slug);
          }
        } catch (error) {
          console.error("Error fetching account from Firestore:", error);
        }
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
    if (
      cartItems.some(
        (item) => (item.slug || item.id) === (account.slug || account.id)
      )
    ) {
      toast.warning(`${account.title} is already in your cart!`);
    } else {
      setCart([...cart, account]);
      toast.success(`${account.title} added to cart!`);
      addToCart(account);
      alert(`${account.title} added to cart!`);
      console.log("Cart updated:", [...cartItems, account]);
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

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="flex justify-center items-center h-screen bg-gray-900">
          <div className="category-loader w-24 h-24 rounded-full animate-spin"></div>
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
            to="/categories"
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
        <div className="px-4 mt-4 md:hidden">
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
                  <Link to={"/profilevisit"}>
                    <img
                      src={AdminIcon}
                      alt="admin"
                      className="w-8 md:w-10 hover:cursor-pointer"
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
            {account.accountCredential && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Account Credentials</h3>
                <p className="text-gray-300">{account.accountCredential}</p>
              </div>
            )}
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
                      className="w-full h-40 bg-gray-300 animate-pulse rounded-md flex items-center justify-center"
                    >
                      <div className="category-loader w-10 h-10 rounded-full animate-spin"></div>
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

        <div className="flex flex-col md:flex-row justify-between items-end md:items-center px-4 py-6 gap-4">
          <div className="hidden md:block">
            <BackButton />
          </div>

          <div className="flex flex-row gap-4 justify-end w-full">
            <Toaster richColors position="top-center" closeIcon={false} />
            <button
              onClick={handleAddToCart}
              className={`flex text-white px-4 py-2 gap-2 rounded-md transition cursor-pointer ${cart.some((item) => (item.slug || item.id) === (account.slug || account.id))
                  ? "bg-[#4B5564] cursor-not-allowed"
                  : "bg-[#1C275E]"
                }`}
              disabled={cartItems.some((item) => (item.slug || item.id) === (account.slug || account.id))}
            >
              {cartItems.some((item) => (item.slug || item.id) === (account.slug || account.id))
                ?
                <>
                  <span className="text-gray-300">In Cart</span>
                  <BsFillCartCheckFill className="self-center" />
                </>
                :
                <>
                  <span className="text-white">Add to Cart</span>
                  <BsCartPlusFill className="self-center" />
                </>
              }
            </button>

            <button
              onClick={handlePurchase}
              className={`flex text-white px-4 py-2 gap-2 rounded-md transition cursor-pointer ${isPurchased
                ? "bg-[#A299C4] cursor-not-allowed"
                : "bg-[#4426B9]"
                }`}
              disabled={isPurchased}
            >
              {isPurchased
                ?
                <>
                  <span className="text-gray-300">Purchased</span>
                  <PiShoppingBagOpenFill className="self-center" />
                </>
                :
                <>
                  <span className="text-white">Purchase</span>
                  <PiShoppingBagFill className="self-center" />
                </>
              }
            </button>
          </div>
        </div>
      </div>
    </>

  );

};

export default AccountDetails;
