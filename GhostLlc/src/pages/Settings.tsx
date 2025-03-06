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
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// Import fonts to match Figma design
import "@fontsource/poppins"; // For headings
import "@fontsource/inter"; // For body text

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
        isEnabled ? "bg-[#8000FF]" : "bg-gray-700"
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

/* Sidebar Button Component */
interface SideButtonProps {
  label: string;
  icon: IconDefinition;
  isActive?: boolean;
}

const SideButton: React.FC<SideButtonProps> = ({
  label,
  icon,
  isActive = false,
}) => {
  return (
    <button
      className={`flex items-center gap-3 w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
        isActive
          ? "bg-[#1e293b] border-l-4 border-[#8000FF] pl-3"
          : "bg-[#1e1e24] hover:bg-[#2a2a32]"
      } text-white font-medium`}
    >
      <FontAwesomeIcon icon={icon} className="text-xl" />
      <span className="font-poppins">{label}</span>
    </button>
  );
};

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [autoDownload, setAutoDownload] = useState(false); // Default OFF

  return (
    <div className="min-h-screen bg-[#0E0E10] text-white flex flex-col font-inter">
      {/* Top Bar */}
      <div className="px-8 py-6 flex items-center">
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
      <div className="flex px-8 py-6 gap-8 items-start">
        {/* Left Column */}
        <div className="w-72 flex flex-col">
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
            <SideButton label="Check update" icon={faSyncAlt} isActive={true} />
            <SideButton label="Language" icon={faGlobe} />
            <SideButton label="Feedback" icon={faCommentAlt} />
            <SideButton label="About Us" icon={faInfoCircle} />
            <SideButton label="Privacy Policy" icon={faShieldAlt} />
            <SideButton label="User Agreement" icon={faHandshake} />
          </div>
          <div className="flex-grow" />
          <div className="mt-12">
            <button className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-base font-medium bg-[#FF3131] hover:bg-[#CC0000] transition-colors duration-200 font-poppins">
              <FontAwesomeIcon icon={faTrash} className="text-base" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1">
          {/* Check Updates Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-poppins mb-4">
              Check Updates
            </h2>
            <div className="border-t border-white my-4"></div>
          </div>

          {/* Download and Install Section */}
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

            {/* Last Update Section */}
            <div>
              <h3 className="text-lg font-semibold font-poppins mb-1">
                Last update
              </h3>
              <p className="text-base text-gray-300 font-inter">
                Last checked on June 26, 2023
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
