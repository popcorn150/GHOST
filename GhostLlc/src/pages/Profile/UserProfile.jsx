import NavBar from "./NavBar";
import { MdOutlineCameraEnhance } from "react-icons/md";
import { BsPencilSquare } from "react-icons/bs";
import {
  FaSave,
  FaTrashAlt,
  FaStar,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";
import { FaSquareFacebook, FaXTwitter, FaLink } from "react-icons/fa6";
import { IoAdd } from "react-icons/io5";
import { LuUpload } from "react-icons/lu";
import { AdminIcon } from "../../utils";
import { useState, useEffect } from "react";
// Firebase imports
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
} from "firebase/firestore";

const tabs = ["Uploads", "Bio", "Socials", "Favorites"];

const Layout = ({ activeTab, setActiveTab, children }) => {
  const [profileImage, setProfileImage] = useState(AdminIcon);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center justify-center p-3 bg-[#010409]">
        <div className="my-10 relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-[#0576FF]">
          <img
            src={profileImage}
            alt="Profile"
            className="w-full h-full object-cover"
          />
          <label
            htmlFor="file-upload"
            className="absolute bottom-2 right-2 bg-black/50 p-2 rounded-full cursor-pointer hover:bg-black/70 transition"
          >
            <MdOutlineCameraEnhance className="text-white w-5 h-5" />
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
        <div className="w-full px-4 sm:px-12 md:px-24 mx-auto">
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
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full h-1 bg-[#0E1115] border-none">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{
                width: "20%",
                transform: `translateX(${tabs.indexOf(activeTab) * 135}%)`,
              }}
            ></div>
          </div>
          <div className="w-full">{children}</div>
        </div>
      </div>
    </>
  );
};

const Uploads = () => {
  // Local states for form fields
  const [accountImage, setAccountImage] = useState(null);
  const [accountName, setAccountName] = useState("");
  const [accountCredential, setAccountCredential] = useState("");
  const [accountWorth, setAccountWorth] = useState("");
  const [accountDescription, setAccountDescription] = useState("");
  const [screenshots, setScreenshots] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedAccounts, setUploadedAccounts] = useState([]);
  const maxScreenshots = 5;
  const [userCurrency, setUserCurrency] = useState("USD");
  const [loadingCurrency, setLoadingCurrency] = useState(true);

  useEffect(() => {
    // Detect user's location and currency
    const detectUserCurrency = async () => {
      try {
        // Check if we have cached location data
        const cachedLocation = localStorage.getItem('userLocation');
        let currencyCode = 'USD'; // Default
        
        if (cachedLocation) {
          const parsedCache = JSON.parse(cachedLocation);
          const cacheAge = Date.now() - parsedCache.timestamp;
          
          // Use cache if it's less than 7 days old
          if (cacheAge < 7 * 24 * 60 * 60 * 1000) {
            currencyCode = parsedCache.data.currency || 'USD';
          } else {
            // Cache expired, fetch new data
            const locationData = await fetchLocationData();
            currencyCode = locationData.currency || 'USD';
          }
        } else {
          // No cache, fetch new data
          const locationData = await fetchLocationData();
          currencyCode = locationData.currency || 'USD';
        }
        
        setUserCurrency(currencyCode);
        setLoadingCurrency(false);
      } catch (err) {
        console.error('Error detecting currency:', err);
        setLoadingCurrency(false);
      }
    };

    // Function to fetch location data
    const fetchLocationData = async () => {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      // Cache the location data
      localStorage.setItem('userLocation', JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      
      return data;
    };

    detectUserCurrency();
  }, []);


  // Handle account image upload (simulate image upload)
  const handleAccountImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAccountImage(imageUrl);
    }
  };

  const handleScreenshotUpload = (event) => {
    if (screenshots.length < maxScreenshots) {
      const file = event.target.files[0];
      if (file) {
        setScreenshots([...screenshots, URL.createObjectURL(file)]);
      }
    }
  };

  // Fetch accounts uploaded by the current user from Firestore
  const fetchAccounts = async () => {
    if (auth.currentUser) {
      try {
        const q = query(
          collection(db, "accounts"),
          where("userId", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const accounts = [];
        querySnapshot.forEach((doc) => {
          accounts.push({ id: doc.id, ...doc.data() });
        });
        setUploadedAccounts(accounts);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchAccounts();
    }
  }, []);

  // Handle form submission to upload an account to Firestore
  const handleUpload = async () => {
    if (
      !accountName ||
      !accountCredential ||
      !accountWorth ||
      !accountDescription
    ) {
      alert("Please fill out all required fields.");
      return;
    }
    try {
      await addDoc(collection(db, "accounts"), {
        userId: auth.currentUser.uid,
        accountName,
        accountCredential,
        accountWorth,
        accountDescription,
        accountImage,
        screenshots,
        currency: userCurrency,
        createdAt: new Date(),
      });
      // Clear form fields after successful upload
      setAccountName("");
      setAccountCredential("");
      setAccountWorth("");
      setAccountDescription("");
      setAccountImage(null);
      setScreenshots([]);
      setIsUploading(false);
      fetchAccounts();
      alert("Account uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  // Handle deletion of an uploaded account
  const handleDelete = async (accountId) => {
    try {
      await deleteDoc(doc(db, "accounts", accountId));
      fetchAccounts();
      alert("Account deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete account.");
    }
  };

  return (
    <div className="p-3">
      {/* Upload Form */}
      <div className="flex flex-col mb-5 sm:flex-row justify-between items-center gap-4 sm:gap-10 p-3 my-3 border border-gray-200">
        <h2 className="text-white text-md md:text-lg text-center sm:text-left">
          Upload An Account
        </h2>
        <button
          className="bg-gray-400 rounded-lg cursor-pointer p-2"
          onClick={() => setIsUploading(!isUploading)}
        >
          <IoAdd className="w-5 h-5 sm:w-7 sm:h-7" />
        </button>
      </div>

      {isUploading && (
        <>
          <div className="flex flex-col md:flex-row justify-between gap-5">
            <div className="grid w-full max-w-4xl gap-4">
              <div className="w-full flex flex-col items-start">
                <label
                  htmlFor="account-image-upload"
                  className="w-full max-w-sm md:w-[500px] h-60 border-2 border-[#0576FF] rounded-xl overflow-hidden flex flex-col items-center justify-center cursor-pointer"
                >
                  {accountImage ? (
                    <img
                      src={accountImage}
                      alt="Account"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MdOutlineCameraEnhance className="text-gray-500 w-16 h-16 sm:w-20 sm:h-20" />
                  )}
                  {!accountImage && (
                    <p className="text-gray-400 text-xs sm:text-sm text-center mt-3">
                      Click to upload account image
                    </p>
                  )}
                </label>
                <input
                  id="account-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAccountImageUpload}
                />
              </div>

              <input
                type="text"
                placeholder="Name of Account"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full p-2 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                required
              />
              <input
                type="text"
                placeholder="Account Credential"
                value={accountCredential}
                onChange={(e) => setAccountCredential(e.target.value)}
                className="w-full p-2 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                required
              />
              {loadingCurrency ? (
                <div className="w-full p-2 rounded bg-[#0E1115] text-gray-400 border border-gray-600">
                  Detecting your currency...
                </div>
              ) : (
                <div>
                  <input
                    type="number"
                    placeholder={`Account's Worth (in ${userCurrency})`}
                    value={accountWorth}
                    onChange={(e) => setAccountWorth(e.target.value)}
                    className="w-full p-2 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                    required
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Currency: {userCurrency}
                  </div>
                </div>
              )}
            </div>

            <div className="w-full">
              <textarea
                placeholder="Full Account Description"
                value={accountDescription}
                onChange={(e) => setAccountDescription(e.target.value)}
                className="w-full h-32 md:h-full p-2 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                required
              ></textarea>
            </div>
          </div>

          <div className="mt-6 border border-gray-300 p-5 rounded-lg">
            <p className="text-white text-lg my-2">Screenshots</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {screenshots.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt="Screenshot"
                  className="w-full h-32 sm:h-40 object-cover rounded-md"
                />
              ))}
              {screenshots.length < maxScreenshots && (
                <label
                  htmlFor="screenshot-upload"
                  className="w-full h-32 sm:h-40 rounded-md flex items-center justify-center bg-gray-700 cursor-pointer"
                >
                  <MdOutlineCameraEnhance className="text-white w-8 h-8 sm:w-10 sm:h-10" />
                </label>
              )}
            </div>
            <input
              id="screenshot-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleScreenshotUpload}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end my-5 gap-3 sm:gap-5">
            <button className="flex items-center gap-2 text-white font-medium bg-[#EB3223] px-4 py-2 rounded cursor-pointer w-full sm:w-auto">
              <FaTrashAlt className="align-middle" />
              Discard
            </button>
            <button
              onClick={handleUpload}
              className="flex items-center gap-2 text-white font-medium bg-[#4426B9] px-4 py-2 rounded cursor-pointer w-full sm:w-auto"
            >
              <LuUpload className="align-middle" />
              Upload
            </button>
          </div>
        </>
      )}

      {/* Display Uploaded Accounts with full details and Delete option */}
      <div className="flex flex-col p-3 my-3 border border-gray-200">
        <h2 className="text-white text-md md:text-lg mb-2">
          Accounts Uploaded
        </h2>
        {uploadedAccounts.length > 0 ? (
          uploadedAccounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-[#161B22] p-4 mb-4 rounded-md shadow-md relative"
            >
              {acc.accountImage && (
                <img
                  src={acc.accountImage}
                  alt={acc.accountName}
                  className="w-full h-48 object-cover mb-2 rounded"
                />
              )}
              <h3 className="text-white text-xl font-semibold">
                {acc.accountName}
              </h3>
              <p className="text-gray-400">
                <span className="font-semibold">Credential:</span>{" "}
                {acc.accountCredential}
              </p>
              <p className="text-gray-400">
              <span className="font-semibold">Worth:</span> {acc.accountWorth}{" "}
              {acc.currency || userCurrency}
            </p>
              <p className="text-gray-400">
                <span className="font-semibold">Description:</span>{" "}
                {acc.accountDescription}
              </p>
              {acc.screenshots && acc.screenshots.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {acc.screenshots.map((shot, index) => (
                    <img
                      key={index}
                      src={shot}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
              {/* Delete button */}
              <button
                onClick={() => handleDelete(acc.id)}
                className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No accounts uploaded yet.</p>
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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDiscard = () => {
    setTempText(aboutText);
    setIsEditing(false);
  };

  const handleSave = () => {
    setAboutText(tempText);
    setIsEditing(false);
  };

  return (
    <div className="p-5">
      <textarea
        className="w-full h-60 p-3 border border-gray-600 rounded-md bg-[#0E1115] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0576FF]"
        placeholder={tempText}
        onChange={(e) => setTempText(e.target.value)}
        readOnly={!isEditing}
      ></textarea>
      <div className="mt-4 flex justify-end gap-3">
        {isEditing ? (
          <>
            <button
              onClick={handleDiscard}
              className="flex items-center gap-2 bg-[#EB3223] text-white px-4 py-2 rounded-md cursor-pointer"
            >
              <FaTrashAlt /> Discard
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#4426B9] text-white px-4 py-2 rounded-md cursor-pointer"
            >
              <FaSave /> Save
            </button>
          </>
        ) : (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 border-2 border-[#0576FF] text-white px-4 py-2 rounded-md cursor-pointer"
          >
            <BsPencilSquare /> Edit
          </button>
        )}
      </div>
    </div>
  );
};

const Socials = () => {
  const [isEditing, setIsEditing] = useState(false);
  const handleEdit = () => setIsEditing(true);
  const handleDiscard = () => setIsEditing(false);
  const handleSave = () => setIsEditing(false);

  return (
    <div className="p-5">
      <h2 className="flex items-center gap-2 text-white text-md font-semibold md:text-lg my-3">
        Link Social accounts
        <FaLink className="text-gray-300 self-center w-5 h-5" />
      </h2>
      <div className="flex items-center mb-2 gap-3 w-full p-2 rounded-lg bg-[#0E1115] text-white border border-gray-600">
        <FaSquareFacebook className="text-gray-300 w-7 h-7" />
        <input
          type="text"
          placeholder="Link your facebook account"
          className="w-full outline-none"
          required
          readOnly={!isEditing}
        />
      </div>
      <div className="flex items-center mb-2 gap-3 w-full p-2 rounded-lg bg-[#0E1115] text-white border border-gray-600">
        <FaInstagram className="text-gray-300 w-7 h-7" />
        <input
          type="text"
          placeholder="Link your instagram account"
          className="w-full outline-none"
          required
          readOnly={!isEditing}
        />
      </div>
      <div className="flex items-center mb-2 gap-3 w-full p-2 rounded-lg bg-[#0E1115] text-white border border-gray-600">
        <FaTiktok className="text-gray-300 w-7 h-7" />
        <input
          type="text"
          placeholder="Link your tiktok account"
          className="w-full outline-none"
          required
          readOnly={!isEditing}
        />
      </div>
      <div className="flex items-center mb-2 gap-3 w-full p-2 rounded-lg bg-[#0E1115] text-white border border-gray-600">
        <FaXTwitter className="text-gray-300 w-7 h-7" />
        <input
          type="text"
          placeholder="Link your twitter account"
          className="w-full outline-none"
          required
          readOnly={!isEditing}
        />
      </div>
      <div className="mt-4 flex justify-end gap-3">
        {isEditing ? (
          <>
            <button
              onClick={handleDiscard}
              className="flex items-center gap-2 bg-[#EB3223] text-white px-4 py-2 rounded-md cursor-pointer"
            >
              <FaTrashAlt /> Discard
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#4426B9] text-white px-4 py-2 rounded-md cursor-pointer"
            >
              <FaSave /> Save
            </button>
          </>
        ) : (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 border-2 border-[#0576FF] text-white px-4 py-2 rounded-md cursor-pointer"
          >
            <BsPencilSquare /> Edit
          </button>
        )}
      </div>
    </div>
  );
};

const Favorites = () => {
  return (
    <div className="p-5">
      <div className="flex items-center p-3 my-3 border border-gray-200">
        <h2 className="flex text-white text-md md:text-lg gap-2">
          Saved Accounts
          <FaStar className="text-gray-300 self-center w-5 h-5" />
        </h2>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("Uploads");

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "Uploads" && <Uploads />}
      {activeTab === "Bio" && <About />}
      {activeTab === "Socials" && <Socials />}
      {activeTab === "Favorites" && <Favorites />}
    </Layout>
  );
};

export default UserProfile;
