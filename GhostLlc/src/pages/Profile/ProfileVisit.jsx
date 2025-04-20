import React from "react";
import NavBar from "./NavBar";
import BackButton from "../../components/BackButton";
import ProfileTab from "../../components/ProfileTab";
import { BellIcon, BookmarkIcon } from "@heroicons/react/24/outline"; // if using heroicons




const ProfileVisit = ({profileImage, username,}) => {
  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center p-3 bg-[#010409]">
  {/* Back Button aligned left */}
  <div className="w-full flex justify-start">
    <BackButton />
  </div>

  {/* Profile Image centered */}
  <div className="mt-6 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-[#0576FF]">
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
  </div>
  <h2 className="text-white text-xl font-semibold mt-6">
          {username || "UnnamedUser"} 
        </h2>
</div>
<div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6">
  <button className="flex items-center justify-center gap-2 px-4 py-2 border border-cyan-500 text-cyan-500 rounded-md hover:bg-cyan-500 hover:text-white transition-all text-sm">
    <BellIcon className="h-5 w-5" />
    Turn on Notification
  </button>

  <button className="flex items-center justify-center gap-2 px-4 py-2 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-500 hover:text-white transition-all text-sm w-51">
    <BookmarkIcon className="h-5 w-5" />
    Add to Favorite
  </button>
</div>

      <div className="mx-auto mt-8 flex justify-center gap-4">
      <ProfileTab />
      </div>
      
    </>
  );
};


export default ProfileVisit;


  