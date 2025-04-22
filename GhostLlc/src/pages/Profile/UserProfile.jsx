import BackButton from "../../components/BackButton";
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
import { auth, db, } from "../../database/firebaseConfig"; // Make sure to import storage
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
import {
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage"; // Import storage functions


const tabs = ["Uploads", "Bio", "Socials", "Favorites"];

const Layout = ({
  activeTab,
  setActiveTab,
  children,
  username,
  profileImage,
  handleImageChange,
}) => {
  return (
    <>
      <NavBar profileImage={profileImage} />
      <div className="flex flex-col items-center justify-center p-3 bg-[#010409]">
        <div className="w-full flex justify-start">
          <BackButton />
        </div>
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
        <h2 className="text-white text-xl font-semibold mb-4">
          {username || "User"}
        </h2>
        <div className="w-full px-4 sm:px-12 md:px-24 mx-auto">
          <div className="flex justify-between border-b relative">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 flex-1 text-center relative cursor-pointer ${activeTab === tab
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

const Uploads = ({ profileImage }) => {
  const [accountImage, setAccountImage] = useState(null);
  const [accountName, setAccountName] = useState("");
  const [accountCredential, setAccountCredential] = useState("");
  const [accountWorth, setAccountWorth] = useState("");
  const [accountDescription, setAccountDescription] = useState("");
  const [screenshots, setScreenshots] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedAccounts, setUploadedAccounts] = useState([]);
  const [userCurrency, setUserCurrency] = useState("USD");
  const [username, setUsername] = useState("");
  const minScreenshots = 3;
  const maxScreenshots = 5;
  const maxDescriptionWords = 100;

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists() && userDocSnap.data().username) {
            setUsername(userDocSnap.data().username);
          } else {
            setUsername(auth.currentUser.displayName || "Unnamed User");
            await setDoc(
              userDocRef,
              { username: auth.currentUser.displayName || "Unnamed User" },
              { merge: true }
            );
          }

          if (userDocSnap.exists() && userDocSnap.data().currency) {
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
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUsername("Unnamed User");
        }
      }
    };
    fetchUserData();
  }, []);

  const handleAccountImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAccountImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScreenshotUpload = (event) => {
    if (screenshots.length < maxScreenshots) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setScreenshots([...screenshots, reader.result]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

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

  const handleUpload = async () => {
    if (!auth.currentUser) {
      alert("Please log in to upload an account.");
      return;
    }
    if (
      !accountName ||
      !accountCredential ||
      !accountWorth ||
      !accountDescription
    ) {
      alert("Please fill out all required fields.");
      return;
    }
    if (screenshots.length < minScreenshots) {
      alert(`Please upload at least ${minScreenshots} screenshots.`);
      return;
    }
    const wordCount = accountDescription.trim().split(/\s+/).length;
    if (wordCount > maxDescriptionWords) {
      alert(
        `Description exceeds ${maxDescriptionWords} words (current: ${wordCount}).`
      );
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const uploadData = {
        userId,
        username,
        accountName,
        accountCredential,
        accountWorth,
        accountDescription,
        accountImage,
        screenshots,
        createdAt: new Date(),
        currency: userCurrency,
      };
      await addDoc(collection(db, "accounts"), uploadData);
      resetForm();
      fetchAccounts();
      alert("Account uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err.code, err.message);
      alert("Failed to upload account: " + err.message);
    }
  };

  const handleDelete = async (account) => {
    try {
      await deleteDoc(doc(db, "accounts", account.id));
      fetchAccounts();
      alert("Account deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete account: " + err.message);
    }
  };

  const resetForm = () => {
    setAccountName("");
    setAccountCredential("");
    setAccountWorth("");
    setAccountDescription("");
    setAccountImage(null);
    setScreenshots([]);
    setIsUploading(false);
  };

  return (
    <div className="p-3">
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
              <input
                type="number"
                placeholder={`Account's Worth (in ${userCurrency})`}
                value={accountWorth}
                onChange={(e) => setAccountWorth(e.target.value)}
                className="w-full p-2 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                required
              />
            </div>
            <div className="w-full">
              <textarea
                placeholder={`Full Account Description (max ${maxDescriptionWords} words)`}
                value={accountDescription}
                onChange={(e) => setAccountDescription(e.target.value)}
                className="w-full h-32 md:h-full p-2 rounded bg-[#0E1115] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                required
              ></textarea>
            </div>
          </div>
          <div className="mt-6 border border-gray-300 p-5 rounded-lg">
            <p className="text-white text-lg my-2">Screenshots</p>
            <p className="text-gray-400 text-sm my-1">
              Minimum {minScreenshots}, Maximum {maxScreenshots}
            </p>
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
            <button
              onClick={resetForm}
              className="flex items-center gap-2 text-white font-medium bg-[#EB3223] px-4 py-2 rounded cursor-pointer w-full sm:w-auto"
            >
              <FaTrashAlt className="align-middle" /> Discard
            </button>
            <button
              onClick={handleUpload}
              className="flex items-center gap-2 text-white font-medium bg-[#4426B9] px-4 py-2 rounded cursor-pointer w-full sm:w-auto"
            >
              <LuUpload className="align-middle" /> Upload
            </button>
          </div>
        </>
      )}
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
              <div className="flex items-center mb-2">
                <img
                  src={profileImage}
                  alt="User Profile"
                  className="w-10 h-10 rounded-full mr-2"
                />
                <div>
                  <h3 className="text-white text-lg font-semibold">
                    {acc.accountName}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    <span className="font-semibold">Uploaded by:</span>{" "}
                    {acc.username || "Unknown"}
                  </p>
                </div>
              </div>
              {acc.accountImage && (
                <img
                  src={acc.accountImage}
                  alt={acc.accountName}
                  className="w-full h-48 object-cover mb-2 rounded-md"
                />
              )}
              <p className="text-gray-400 text-sm">
                <span className="font-semibold">Credential:</span>{" "}
                {acc.accountCredential}
              </p>
              <p className="text-gray-400 text-sm">
                <span className="font-semibold">Worth:</span> {acc.accountWorth}{" "}
                ({acc.currency || userCurrency})
              </p>
              <p className="text-gray-400 text-sm">
                <span className="font-semibold">Description:</span>{" "}
                {acc.accountDescription}
              </p>
              {acc.screenshots && acc.screenshots.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                  {acc.screenshots.map((shot, index) => (
                    <img
                      key={index}
                      src={shot}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                  ))}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                {/* <button className="text-white bg-gray-200">
                  I
                </button> */}
                <button
                  onClick={() => handleDelete(acc)}
                  className="absolute bottom-0 right-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
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

  const handleEdit = () => setIsEditing(true);
  const handleDiscard = () => {
    setTempText(aboutText);
    setIsEditing(false);
  };
  const handleSave = async () => {
    setAboutText(tempText);
    setIsEditing(false);

    // Save bio to Firestore
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          bio: tempText
        });
      } catch (error) {
        console.error("Error saving bio:", error);
      }
    }
  };

  // Load bio from Firestore
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
  const [socials, setSocials] = useState({
    facebook: "",
    instagram: "",
    tiktok: "",
    twitter: ""
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

    // Save socials to Firestore
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          socials: tempSocials
        });
      } catch (error) {
        console.error("Error saving social links:", error);
      }
    }
  };

  const handleChange = (platform, value) => {
    setTempSocials(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  // Load socials from Firestore
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
          console.error("Error fetching social links:", error);
        }
      }
    };
    fetchSocials();
  }, []);

  return (
    <div className="p-5">
      <h2 className="flex items-center gap-2 text-white text-md font-semibold md:text-lg my-3">
        Link Social accounts{" "}
        <FaLink className="text-gray-300 self-center w-5 h-5" />
      </h2>
      <div className="flex items-center mb-2 gap-3 w-full p-2 rounded-lg bg-[#0E1115] text-white border border-gray-600">
        <FaSquareFacebook className="text-gray-300 w-7 h-7" />
        <input
          type="text"
          placeholder="Link your facebook account"
          className="w-full outline-none bg-transparent"
          value={tempSocials.facebook}
          onChange={(e) => handleChange("facebook", e.target.value)}
          readOnly={!isEditing}
        />
      </div>
      <div className="flex items-center mb-2 gap-3 w-full p-2 rounded-lg bg-[#0E1115] text-white border border-gray-600">
        <FaInstagram className="text-gray-300 w-7 h-7" />
        <input
          type="text"
          placeholder="Link your instagram account"
          className="w-full outline-none bg-transparent"
          value={tempSocials.instagram}
          onChange={(e) => handleChange("instagram", e.target.value)}
          readOnly={!isEditing}
        />
      </div>
      <div className="flex items-center mb-2 gap-3 w-full p-2 rounded-lg bg-[#0E1115] text-white border border-gray-600">
        <FaTiktok className="text-gray-300 w-7 h-7" />
        <input
          type="text"
          placeholder="Link your tiktok account"
          className="w-full outline-none bg-transparent"
          value={tempSocials.tiktok}
          onChange={(e) => handleChange("tiktok", e.target.value)}
          readOnly={!isEditing}
        />
      </div>
      <div className="flex items-center mb-2 gap-3 w-full p-2 rounded-lg bg-[#0E1115] text-white border border-gray-600">
        <FaXTwitter className="text-gray-300 w-7 h-7" />
        <input
          type="text"
          placeholder="Link your twitter account"
          className="w-full outline-none bg-transparent"
          value={tempSocials.twitter}
          onChange={(e) => handleChange("twitter", e.target.value)}
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
          Saved Accounts{" "}
          <FaStar className="text-gray-300 self-center w-5 h-5" />
        </h2>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("Uploads");
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState(AdminIcon);
  const [isLoading, setIsLoading] = useState(true);

  // Function to handle profile image upload
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file && auth.currentUser) {
      try {
        // Show loading state
        setIsLoading(true);

        // Convert file to base64 string
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = async () => {
          const base64String = reader.result;

          // Store the base64 string directly in Firestore
          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, {
            profileImage: base64String,
          });

          // Update state
          setProfileImage(base64String);
          setIsLoading(false);
        };
      } catch (error) {
        console.error("Error uploading profile image:", error);
        setIsLoading(false);
        alert("Failed to upload profile image. Please try again.");
      }
    }
  };

  // Fetch user data including profile image when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            // Set username
            if (userDocSnap.data().username) {
              setUsername(userDocSnap.data().username);
            } else {
              const defaultUsername =
                auth.currentUser.displayName || "Unnamed User";
              setUsername(defaultUsername);
              await updateDoc(userDocRef, { username: defaultUsername });
            }

            // Set profile image if exists
            if (userDocSnap.data().profileImage) {
              setProfileImage(userDocSnap.data().profileImage);
            }
          } else {
            // Create new user document if it doesn't exist
            const defaultUsername =
              auth.currentUser.displayName || "Unnamed User";
            await setDoc(userDocRef, {
              username: defaultUsername,
              profileImage: AdminIcon,
              createdAt: new Date(),
            });
            setUsername(defaultUsername);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#010409]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0576FF]"></div>
      </div>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      username={username}
      profileImage={profileImage}
      handleImageChange={handleImageChange}
    >
      {activeTab === "Uploads" && <Uploads profileImage={profileImage} />}
      {activeTab === "Bio" && <About />}
      {activeTab === "Socials" && <Socials />}
      {activeTab === "Favorites" && <Favorites />}
    </Layout>
  );
};

export default UserProfile;