import { useState } from "react";
import {
  UploadCloud,
  User,
  Heart,
  Trophy,
} from "lucide-react";

const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState("About");

  const tabs = [
    { name: "Uploads", icon: UploadCloud },
    { name: "About", icon: User },
    { name: "Wishlist", icon: Heart },
    { name: "Achievements", icon: Trophy },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Uploads":
        return <p className="text-white">Uploads content goes here</p>;
      case "About":
        return <p className="text-white">About content goes here</p>;
      case "Wishlist":
        return <p className="text-white">Wishlist content goes here</p>;
      case "Achievements":
        return <p className="text-white">Achievements content goes here</p>;
      default:
        return null;
    }
  };

  return (
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
            width: "20%",
            transform: `translateX(${
              tabs.findIndex((tab) => tab.name === activeTab) * 135
            }%)`,
          }}
        ></div>
      </div>

      <div className="w-full p-5">{renderContent()}</div>
    </div>
  );
};

export default ProfileTabs;
