import { useState } from "react";
import NavBar from "./NavBar";
import BackButton from "../../components/BackButton";
import ProfileTab from "../../components/ProfileTab";
import {
  BellAlertIcon,
  BellSlashIcon,
  BookmarkIcon,
  BookmarkSlashIcon
} from "@heroicons/react/24/outline";
import { Toaster, toast } from 'sonner';


const ProfileVisit = ({ profileImage, username, }) => {
  const [notificationOn, setNotificationOn] = useState(false);
  const [inFavorites, setInFavorites] = useState(false);

  const handleNotificationToggle = () => {
    const turningOn = !notificationOn;

    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setNotificationOn(turningOn);
          resolve();
        }, 1500);
      }),
      {
        loading: turningOn ? "Turning on notifications..." : "Turning off notifications...",
        success: turningOn ? "Notifications turned on!" : "Notifications turned off!",
        error: "Something went wrong. Failed to turn on notifications.",
      }
    )
  };

  const handleFavorites = () => {
    const addingToFavorites = !inFavorites;

    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setInFavorites(addingToFavorites);
          resolve();
        }, 1500);
      }),
      {
        loading: addingToFavorites ? "Adding to favorites..." : "Removing from favorites...",
        success: addingToFavorites ? "Added to favorites!" : "Removed from favorites!",
        error: "Something wwent wrong. Failed to add to favorites.",
      }
    );
  };

  return (
    <>
      <NavBar />
      <Toaster richColors position="top-center" closeIcon={false} />
      <div className="flex flex-col items-center p-3 bg-[#010409]">
        <div className="w-full flex justify-start">
          <BackButton />
        </div>

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
        <button
          onClick={handleFavorites}
          className={`flex items-center justify-center gap-2 px-4 py-2 
            border border-purple-500 text-purple-500 rounded-md 
            transition-all text-sm w-fit ${inFavorites
              ? ""
              : "bg-transparent"
            }`}
        >
          {inFavorites
            ?
            <>
              <BookmarkSlashIcon className="h-5 w-5 self-center" />
              <span>Remove from Favorites</span>
            </>
            :
            <>
              <BookmarkIcon className="h-5 w-5 self-center" />
              <span>Add to Favorites</span>
            </>
          }
        </button>

        <button
          onClick={handleNotificationToggle}
          className={`flex items-center justify-center gap-2 px-4 py-2 
          border border-cyan-500 text-cyan-500 rounded-md
          transition-all text-sm w-fit ${notificationOn
              ? ""
              : "bg-transparent"
            }`}
        >
          {notificationOn
            ? (
              <>
                <BellSlashIcon className="h-5 w-5 self-center" />
                <span>Turn off Notifications</span>
              </>
            )
            : (
              <>
                <BellAlertIcon className="h-5 w-5 self-center" />
                <span>Turn on Notifications</span>
              </>
            )
          }
        </button>
      </div>

      <div className="mx-auto mt-8 flex justify-center gap-4">
        <ProfileTab />
      </div>

    </>
  );
};


export default ProfileVisit;


