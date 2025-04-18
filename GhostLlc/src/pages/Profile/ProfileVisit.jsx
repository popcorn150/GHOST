import React from "react";
import NavBar from "./NavBar";
import BackButton from "../../components/BackButton";
import { NavLogo, ProfileIcon } from "../../utils";
import ProfileTab from "../../components/ProfileTab";

const ProfileVisit = () => {
  return (
    <>
      <NavBar />
      <div className="mx-auto mt-10 flex justify-start px-4">
        <BackButton />
        <img src={NavLogo} alt="Navbar" className="w-40 h-8 md:h-10 mx-auto" />
      </div>
      <div className="mx-auto mt-30 flex justify-center gap-4">
      <ProfileTab />
      </div>
      
    </>
  );
};

export default ProfileVisit;


  