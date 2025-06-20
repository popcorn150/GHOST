import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSyncAlt,
  faGlobe,
  faCommentAlt,
  faInfoCircle,
  faShieldAlt,
  faHandshake,
  faTrash,
  faChevronDown,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { auth, db } from "../database/firebaseConfig";
import { deleteUser, signOut } from "firebase/auth";
import {
  doc,
  deleteDoc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { MdOutlineCameraEnhance } from "react-icons/md";
import BackButton from "../components/BackButton"; 

import "@fontsource/poppins";
import "@fontsource/inter";

interface ToggleSwitchProps {
  enabled?: boolean;
  onToggle: (val: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  enabled = false,
  onToggle,
}) => {
  const [isEnabled, setIsEnabled] = useState(enabled);

  const handleToggle = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    onToggle(newValue);
  };

  return (
    <div
      onClick={handleToggle}
      className={`w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${
        isEnabled ? "bg-[#4426B9]" : "bg-gray-700"
      }`}
    >
      <div
        className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300 ease-in-out ${
          isEnabled ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </div>
  );
};

interface RadioButtonProps {
  id: string;
  label: string;
  selected: boolean;
  onChange: () => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  id,
  label,
  selected,
  onChange,
}) => {
  return (
    <div
      className="flex items-center w-full p-4 bg-[#272730] rounded-lg cursor-pointer"
      onClick={onChange}
    >
      <div className="relative w-6 h-6 mr-3">
        <div
          className={`w-6 h-6 border-2 rounded-full transition-colors duration-200 ${
            selected ? "border-[#4426B9]" : "border-gray-500"
          }`}
        ></div>
        {selected && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#4426B9] rounded-full"></div>
        )}
      </div>
      <span className="text-white">{label}</span>
    </div>
  );
};

interface LanguageDropdownProps {
  selected: string;
  onChange: (value: string) => void;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  selected,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const languages = ["English", "Spanish", "French", "German", "Japanese"];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-[#272730] rounded-lg text-white"
      >
        <span>{selected}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="absolute mt-1 w-full bg-[#1e1e24] rounded-lg shadow-lg z-10">
          {languages.map((lang) => (
            <div
              key={lang}
              onClick={() => {
                onChange(lang);
                setIsOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer hover:bg-[#2a2a32] ${
                selected === lang ? "text-[#4426B9]" : "text-white"
              }`}
            >
              {lang}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Settings: React.FC = () => {
  const [autoDownload, setAutoDownload] = useState(false);
  const [activeSection, setActiveSection] = useState("check-update");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState("");
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    if (!auth.currentUser) return;

    const userDocRef = doc(db, "users", auth.currentUser.uid);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists() && doc.data().profileImage) {
        setProfileImage(doc.data().profileImage);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !auth.currentUser) return;

    try {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);

      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userDocRef, { profileImage: imageUrl }, { merge: true });

      console.log("Profile image updated successfully");
    } catch (error) {
      console.error("Error updating profile image:", error);
    }
  };

  const handleSubmitFeedback = () => {
    console.log({ feedbackType, feedbackText });
    setFeedbackType("");
    setFeedbackText("");
    alert("Feedback submitted successfully!");
  };

  const handleFinalDelete = async () => {
    if (!auth.currentUser) {
      alert("No user is currently logged in.");
      return;
    }

    // Show confirmation dialog
    const confirmation = window.confirm(
      "Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete all your data."
    );

    if (!confirmation) {
      return;
    }

    try {
      const userId = auth.currentUser.uid;

      console.log("Starting account deletion for user:", userId);

      // Step 1: Delete all game accounts uploaded by this user
      try {
        const accountsQuery = query(
          collection(db, "accounts"),
          where("userId", "==", userId)
        );
        const accountsSnapshot = await getDocs(accountsQuery);
        console.log(`Found ${accountsSnapshot.docs.length} accounts to delete`);
        
        for (const accountDoc of accountsSnapshot.docs) {
          await deleteDoc(accountDoc.ref);
          console.log(`Deleted account: ${accountDoc.id}`);
        }
      } catch (error) {
        console.error("Error deleting accounts:", error);
        // Continue with other deletions even if this fails
      }

      // Step 2: Delete user's profile from UserProfile collection (only if it exists)
      try {
        const userProfileRef = doc(db, "UserProfile", userId);
        await deleteDoc(userProfileRef);
        console.log("Deleted UserProfile");
      } catch (error) {
        console.error("Error deleting UserProfile:", error);
        // Continue with other deletions
      }

      // Step 3: Delete username mapping if it exists
      try {
        const usernamesQuery = query(
          collection(db, "usernames"),
          where("uid", "==", userId)
        );
        const usernamesSnapshot = await getDocs(usernamesQuery);
        console.log(`Found ${usernamesSnapshot.docs.length} username mappings to delete`);
        
        for (const usernameDoc of usernamesSnapshot.docs) {
          await deleteDoc(usernameDoc.ref);
          console.log(`Deleted username mapping: ${usernameDoc.id}`);
        }
      } catch (error) {
        console.error("Error deleting username mappings:", error);
        // Continue with other deletions
      }

      // Step 4: Delete subcollections under users/{userId} (like visitors)
      try {
        // Delete visitors subcollection
        const visitorsQuery = query(collection(db, `users/${userId}/visitors`));
        const visitorsSnapshot = await getDocs(visitorsQuery);
        console.log(`Found ${visitorsSnapshot.docs.length} visitor records to delete`);
        
        for (const visitorDoc of visitorsSnapshot.docs) {
          await deleteDoc(visitorDoc.ref);
          console.log(`Deleted visitor record: ${visitorDoc.id}`);
        }
      } catch (error) {
        console.error("Error deleting visitor records:", error);
        // Continue with other deletions
      }

      // Step 5: Delete user document from users collection
      try {
        const userDocRef = doc(db, "users", userId);
        await deleteDoc(userDocRef);
        console.log("Deleted main user document");
      } catch (error) {
        console.error("Error deleting main user document:", error);
        // Continue to try deleting auth user
      }

      // Step 6: Finally, delete the Firebase Auth user
      try {
        await deleteUser(auth.currentUser);
        console.log("Deleted Firebase Auth user");
        
        alert("Your account has been successfully deleted.");
        window.location.href = "/login";
      } catch (authError) {
        console.error("Error deleting Firebase Auth user:", authError);
        if ((authError as any).code === "auth/requires-recent-login") {
          alert(
            "This operation requires recent authentication. You will be signed out. Please log back in and try deleting your account again."
          );
          await signOut(auth);
          window.location.href = "/login";
        } else {
          // Even if auth deletion fails, we've deleted the data
          alert("Account data deleted, but there was an issue removing authentication. Please contact support.");
        }
      }

    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account: " + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col font-inter">
      <div className="px-4 sm:px-8 py-6 flex items-center">
        <BackButton />
        <h1 className="text-2xl font-bold text-center flex-grow mr-20">
          Settings 
        </h1>
      </div>

      <div className="flex flex-col md:flex-row px-4 sm:px-8 py-6 gap-8 items-start">
        <div className="w-full md:w-72 flex flex-col">
          <div className="flex flex-col mb-6">
            <div className="w-28 h-28 rounded-full mb-4 overflow-hidden bg-transparent border-2 border-[#79E2F2] relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400 text-4xl">?</span>
                </div>
              )}
              <label
                htmlFor="profile-upload"
                className="absolute bottom-2 right-2 bg-black/50 p-2 rounded-full cursor-pointer hover:bg-black/70 transition"
              >
                <MdOutlineCameraEnhance className="text-white w-5 h-5" />
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <h2 className="text-2xl font-bold font-poppins mb-1">
              Change profile
            </h2>
            <p className="text-sm text-gray-300 font-inter">
              Click on your profile to make a change.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setActiveSection("check-update")}
              className={`flex items-center gap-3 w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
                activeSection === "check-update"
                  ? "bg-[#1e293b] border-l-4 border-[#4426B9] pl-3"
                  : "bg-[#1e1e24] hover:bg-[#2a2a32]"
              } text-white font-medium`}
            >
              <FontAwesomeIcon icon={faSyncAlt} className="text-xl" />
              <span className="font-poppins">Check update</span>
            </button>
            <button
              onClick={() => setActiveSection("language")}
              className={`flex items-center gap-3 w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
                activeSection === "language"
                  ? "bg-[#1e293b] border-l-4 border-[#4426B9] pl-3"
                  : "bg-[#1e1e24] hover:bg-[#2a2a32]"
              } text-white font-medium`}
            >
              <FontAwesomeIcon icon={faGlobe} className="text-xl" />
              <span className="font-poppins">Language</span>
            </button>
            <button
              onClick={() => setActiveSection("feedback")}
              className={`flex items-center gap-3 w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
                activeSection === "feedback"
                  ? "bg-[#1e293b] border-l-4 border-[#4426B9] pl-3"
                  : "bg-[#1e1e24] hover:bg-[#2a2a32]"
              } text-white font-medium`}
            >
              <FontAwesomeIcon icon={faCommentAlt} className="text-xl" />
              <span className="font-poppins">Feedback</span>
            </button>
            <button
              onClick={() => setActiveSection("about-us")}
              className={`flex items-center gap-3 w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
                activeSection === "about-us"
                  ? "bg-[#1e293b] border-l-4 border-[#4426B9] pl-3"
                  : "bg-[#1e1e24] hover:bg-[#2a2a32]"
              } text-white font-medium`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="text-xl" />
              <span className="font-poppins">About Us</span>
            </button>
            <button
              onClick={() => setActiveSection("privacy-policy")}
              className={`flex items-center gap-3 w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
                activeSection === "privacy-policy"
                  ? "bg-[#1e293b] border-l-4 border-[#4426B9] pl-3"
                  : "bg-[#1e1e24] hover:bg-[#2a2a32]"
              } text-white font-medium`}
            >
              <FontAwesomeIcon icon={faShieldAlt} className="text-xl" />
              <span className="font-poppins">Privacy Policy</span>
            </button>
            <button
              onClick={() => setActiveSection("user-agreement")}
              className={`flex items-center gap-3 w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
                activeSection === "user-agreement"
                  ? "bg-[#1e293b] border-l-4 border-[#4426B9] pl-3"
                  : "bg-[#1e1e24] hover:bg-[#2a2a32]"
              } text-white font-medium`}
            >
              <FontAwesomeIcon icon={faHandshake} className="text-xl" />
              <span className="font-poppins">User Agreement</span>
            </button>
          </div>

          <div className="flex-grow" />
          <div className="mt-12">
            <button
              onClick={() => setActiveSection("delete-account")}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-base font-medium bg-[#FF3131] hover:bg-[#CC0000] transition-colors duration-200 font-poppins"
            >
              <FontAwesomeIcon icon={faTrash} className="text-base" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        <div className="w-full md:flex-1">
          {activeSection === "check-update" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold font-poppins mb-4">
                  Check Updates
                </h2>
                <div className="border-t border-white my-4"></div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold font-poppins mb-1 mt-4">
                  Download and Install
                </h3>
                <div className="mb-10">
                  <p className="text-base text-gray-300 max-w-[600px] leading-relaxed font-inter">
                    Downloading via mobile networks may result in additional
                    charges. If possible, download via a Wi-Fi network instead.
                  </p>
                </div>

                <div className="mb-10">
                  <h3 className="text-lg font-semibold font-poppins mb-1">
                    Auto download over Wi-Fi
                  </h3>
                  <div className="flex items-center justify-between max-w-[600px]">
                    <p className="text-base text-gray-300 max-w-[70%] leading-relaxed font-inter">
                      Download software updates automatically when connected to
                      Wi-Fi network.
                    </p>
                    <ToggleSwitch
                      enabled={autoDownload}
                      onToggle={setAutoDownload}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold font-poppins mb-1">
                    Last update
                  </h3>
                  <p className="text-base text-gray-300 font-inter">
                    Last checked on June 26, 2023
                  </p>
                </div>
              </div>
            </>
          )}

          {activeSection === "language" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold font-poppins mb-4">
                  Change Language
                </h2>
                <div className="border-t border-white my-4"></div>
              </div>

              <div className="flex items-center mb-8">
                <div className="w-40">
                  <p className="text-xl font-semibold font-poppins">Default</p>
                </div>
                <div className="w-64">
                  <LanguageDropdown
                    selected={selectedLanguage}
                    onChange={setSelectedLanguage}
                  />
                </div>
              </div>
            </>
          )}

          {activeSection === "feedback" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold font-poppins mb-4">
                  What's your feedback about?
                </h2>
                <div className="border-t border-white my-4"></div>
              </div>

              <div className="space-y-4 max-w-[600px] mb-6">
                <RadioButton
                  id="viewing"
                  label="Viewing Experience"
                  selected={feedbackType === "viewing"}
                  onChange={() => setFeedbackType("viewing")}
                />
                <RadioButton
                  id="navigation"
                  label="Navigation system"
                  selected={feedbackType === "navigation"}
                  onChange={() => setFeedbackType("navigation")}
                />
                <RadioButton
                  id="uploading"
                  label="Uploading"
                  selected={feedbackType === "uploading"}
                  onChange={() => setFeedbackType("uploading")}
                />
              </div>

              <div className="max-w-[600px] mb-6">
                <h3 className="text-lg font-semibold font-poppins mb-2">
                  Tell us a little more (Optional)
                </h3>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Please tell us any other issues we should look into in detail."
                  className="w-full min-h-[200px] p-4 bg-[#272730] rounded-lg text-white placeholder-gray-400"
                />
              </div>

              <div className="max-w-[600px] flex justify-end">
                <button
                  onClick={handleSubmitFeedback}
                  className="bg-[#4CAF50] hover:bg-[#3e8e41] text-white font-medium py-3 px-12 rounded-lg transition-colors duration-200"
                >
                  Submit
                </button>
              </div>
            </>
          )}

          {activeSection === "about-us" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold font-poppins mb-4">
                  Want to know more About Us?
                </h2>
                <div className="border-t border-white my-4"></div>
              </div>
              <div>
                <p className="text-base text-gray-300 font-inter">
                  Visit our website for more info{" "}
                  <a
                    href="https://example.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4426B9] hover:underline"
                  >
                    here
                    <FontAwesomeIcon
                      icon={faExternalLinkAlt}
                      className="ml-1 text-sm"
                    />
                  </a>
                </p>
              </div>
            </>
          )}

          {activeSection === "privacy-policy" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold font-poppins mb-4">
                  Our Privacy Policy
                </h2>
                <div className="border-t border-white my-4"></div>
              </div>
              <div>
                <p className="text-base text-gray-300 font-inter">
                  Visit our website for more info{" "}
                  <a
                    href="https://example.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4426B9] hover:underline"
                  >
                    here
                    <FontAwesomeIcon
                      icon={faExternalLinkAlt}
                      className="ml-1 text-sm"
                    />
                  </a>
                </p>
              </div>
            </>
          )}

          {activeSection === "user-agreement" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold font-poppins mb-4">
                  User Agreement
                </h2>
                <div className="border-t border-white my-4"></div>
              </div>
              <div>
                <p className="text-base text-gray-300 font-inter">
                  Visit our website for more info{" "}
                  <a
                    href="https://example.com/useragreement"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4426B9] hover:underline"
                  >
                    here
                    <FontAwesomeIcon
                      icon={faExternalLinkAlt}
                      className="ml-1 text-sm"
                    />
                  </a>
                </p>
              </div>
            </>
          )}

          {activeSection === "delete-account" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold font-poppins mb-4">
                  Really delete your account?
                </h2>
                <div className="border-t border-white my-4"></div>
              </div>

              <div className="bg-[#3d2222] border-l-4 border-red-600 p-4 mb-6 rounded-lg">
                <p className="text-red-400 font-semibold">
                  Unexpected bad things may happen if you don't read this!
                </p>
              </div>

              <ul className="list-disc list-outside ml-6 text-gray-300 space-y-2 mb-8">
                <li>
                  Your account would be removed from our database completely.
                </li>
                <li>You would no longer have access to any of our features.</li>
                <li>
                  All your achievements would be lost and you won't get them
                  back after signing up again.
                </li>
                <li>
                  All your uploaded game accounts will be permanently deleted.
                </li>
                <li>
                  Deleting your account without removing your finances first
                  would lead to loss of that finance and no refund from us.
                </li>
              </ul>

              <button
                onClick={handleFinalDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg"
              >
                I understand and wish to delete my account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;