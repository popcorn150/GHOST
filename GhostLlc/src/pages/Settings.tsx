import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
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
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import "@fontsource/poppins"; 
import "@fontsource/inter"; 
/* Toggle Switch Component */
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

/* Radio Button Component */
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

/* Sidebar Button Component */
interface SideButtonProps {
  label: string;
  icon: IconDefinition;
  isActive?: boolean;
  onClick?: () => void;
}

const SideButton: React.FC<SideButtonProps> = ({
  label,
  icon,
  isActive = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
        isActive
          ? "bg-[#1e293b] border-l-4 border-[#4426B9] pl-3"
          : "bg-[#1e1e24] hover:bg-[#2a2a32]"
      } text-white font-medium`}
    >
      <FontAwesomeIcon icon={icon} className="text-xl" />
      <span className="font-poppins">{label}</span>
    </button>
  );
};

/* Language Dropdown Component */
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
  const navigate = useNavigate();
  const [autoDownload, setAutoDownload] = useState(false);
  const [activeSection, setActiveSection] = useState("check-update");
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  // Feedback state
  const [feedbackType, setFeedbackType] = useState("");
  const [feedbackText, setFeedbackText] = useState("");

  // Handler for submitting feedback
  const handleSubmitFeedback = () => {
    console.log({ feedbackType, feedbackText });
    setFeedbackType("");
    setFeedbackText("");
    alert("Feedback submitted successfully!");
  };

  // Handler for final "delete account" confirmation
  const handleFinalDelete = () => {
    alert("Account deleted. You can add real logic here.");
    // Perform any actual account deletion logic, API calls, etc.
  };

  return (
    <div className="min-h-screen bg-[#0E0E10] text-white flex flex-col font-inter">
      {/* Top Bar */}
      <div className="px-4 sm:px-8 py-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-[#1e1e24] rounded-lg py-2 px-4 hover:bg-[#2a2a32] transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          <span className="font-medium font-poppins">Back</span>
        </button>
        <h1 className="text-3xl font-bold font-poppins text-center flex-grow mr-24">
          Settings
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row px-4 sm:px-8 py-6 gap-8 items-start">
        {/* Left Column */}
        <div className="w-full md:w-72 flex flex-col">
          <div className="flex flex-col mb-6">
            <div className="w-28 h-28 rounded-full mb-4 overflow-hidden bg-transparent border-2 border-[#79E2F2] relative">
              {/* Profile avatar content */}
              <div className="w-full h-full bg-black flex items-center justify-center">
                <div className="bg-yellow-400 rounded-full w-16 h-16 flex items-center justify-center">
                  <div className="flex">
                    <div className="w-3 h-3 bg-blue-900 rounded-full mx-1"></div>
                    <div className="w-3 h-3 bg-blue-900 rounded-full mx-1"></div>
                  </div>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold font-poppins mb-1">
              Change profile
            </h2>
            <p className="text-sm text-gray-300 font-inter">
              Click on your profile to make a change.
            </p>
          </div>

          <div className="space-y-3">
            <SideButton
              label="Check update"
              icon={faSyncAlt}
              isActive={activeSection === "check-update"}
              onClick={() => setActiveSection("check-update")}
            />
            <SideButton
              label="Language"
              icon={faGlobe}
              isActive={activeSection === "language"}
              onClick={() => setActiveSection("language")}
            />
            <SideButton
              label="Feedback"
              icon={faCommentAlt}
              isActive={activeSection === "feedback"}
              onClick={() => setActiveSection("feedback")}
            />
            <SideButton
              label="About Us"
              icon={faInfoCircle}
              isActive={activeSection === "about-us"}
              onClick={() => setActiveSection("about-us")}
            />
            <SideButton
              label="Privacy Policy"
              icon={faShieldAlt}
              isActive={activeSection === "privacy-policy"}
              onClick={() => setActiveSection("privacy-policy")}
            />
            <SideButton
              label="User Agreement"
              icon={faHandshake}
              isActive={activeSection === "user-agreement"}
              onClick={() => setActiveSection("user-agreement")}
            />
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

        {/* Right Column */}
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

              {/* Warning Box */}
              <div className="bg-[#3d2222] border-l-4 border-red-600 p-4 mb-6 rounded-lg">
                <p className="text-red-400 font-semibold">
                  Unexpected bad things may happen if you don't read this!
                </p>
              </div>

              {/* Consequences List */}
              <ul className="list-disc list-outside ml-6 text-gray-300 space-y-2 mb-8">
                <li>
                  Your account would be removed from our database completely.
                </li>
                <li>You would no longer have access to any of our features.</li>
                <li>
                  All your achievements would be lost and you won’t get them
                  back after signing up again.
                </li>
                <li>
                  Deleting your account without removing your finances first
                  would lead to loss of that finance and no refund from us.
                </li>
              </ul>

              {/* Final Confirmation Button */}
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
