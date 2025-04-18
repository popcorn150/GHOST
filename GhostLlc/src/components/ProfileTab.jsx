import React, { useState } from "react";

const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState("About");

  const tabs = ["Uploads", "About", "Wishlist", "Achievements"];

  const renderContent = () => {
    switch (activeTab) {
      case "Uploads":
        return <p className="text-white">// Uploads content goes here</p>;
      case "About":
        return <p className="text-white">// About content goes here</p>;
      case "Wishlist":
        return <p className="text-white">// Wishlist content goes here</p>;
      case "Achievements":
        return <p className="text-white">// Achievements content goes here</p>;
      default:
        return null;
    }
  };

  return (
      <>
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
            <div className="w-full">{renderContent()}</div>
          </div>
      </>
    );
  };

export default ProfileTabs;
