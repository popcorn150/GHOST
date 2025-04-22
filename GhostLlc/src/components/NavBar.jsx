import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Menu, User, Settings, LogOut } from "lucide-react";
import { NavLogo, ProfileIcon } from "../utils";
import { IoCartOutline } from "react-icons/io5";
import { IoGlobeOutline } from "react-icons/io5";
import { IoWalletOutline } from "react-icons/io5";
import { MdOutlinePolicy } from "react-icons/md";
import { HiOutlineFolderOpen } from "react-icons/hi2";
import { IoHomeOutline  } from "react-icons/io5";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";


const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  return (
    <nav className="sticky top-0 bg-[#0E1115] text-white flex items-center justify-between p-4 shadow-md z-50">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="hover:cursor-pointer"
      >
        {menuOpen ? <X size={30} /> : <Menu size={30} />}
      </button>

      {menuOpen && (
        <div className="fixed inset-0 bg-[#0E1115] bg-opacity-80 z-50 flex flex-col w-64 p-6">
          <button
            onClick={() => setMenuOpen(false)}
            className="self-end mb-4 cursor-pointer"
          >
            <X size={24} />
          </button>
          <ul className="space-y-4">
          <li>
              <Link to="/categories" className="flex gap-2 hover:text-gray-400">
                Home <IoHomeOutline  className="self-center w-5 h-5" />
              </Link>
            </li>
            <li>
              <Link to="/cart" className="flex gap-2 hover:text-gray-400">
                Cart <IoCartOutline className="self-center w-5 h-5" />
              </Link>
            </li>
            <li>
              <Link to="/doc" className="flex gap-2 hover:text-gray-400">
                Doc <HiOutlineFolderOpen className="self-center w-5 h-5" />
              </Link>
            </li>
            <li>
              <Link to="/faqs" className="flex gap-2 hover:text-gray-400">
                FAQs <HiOutlineQuestionMarkCircle className="self-center w-5 h-5" />
              </Link>
            </li>
            {/* <li>
              <Link to="/store" className="flex gap-2 hover:text-gray-400">
                Store <IoStorefrontOutline className="self-center w-5 h-5" />
              </Link>
            </li> */}
            <li>
              <Link to="/community" className="flex gap-2 hover:text-gray-400">
                Community <IoGlobeOutline className="self-center w-5 h-5" />
              </Link>
            </li>
            <li>
              <Link to="/withdraw" className="flex gap-2 hover:text-gray-400">
                Withdrawal <IoWalletOutline className="self-center w-5 h-5" />
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="flex gap-2 hover:text-gray-400">
                Privacy Policy <MdOutlinePolicy className="self-center w-5 h-5" />
              </Link>
            </li>
          </ul>
        </div>
      )}

      <img src={NavLogo} alt="Navbar" className="w-40 h-8 md:h-10 mx-auto" />

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="hover:cursor-pointer"
        >
          <img
            src={ProfileIcon}
            alt="profile"
            className="w-14 items-center rounded-lg"
          />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 bg-gray-800 p-4 rounded-lg w-40 shadow-lg">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <User size={16} /> <Link to="/profile">Account</Link>
              </li>
              <li
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  navigate("/settings");
                  setDropdownOpen(false);
                }}
              >
                <Settings size={16} /> <span>Settings</span>
              </li>
              <li
                className="flex items-center gap-2"
                onClick={() => {
                  navigate("/login");
                  setDropdownOpen(false);
                }}
              >
                <LogOut size={16} /> <span className="hover:cursor-pointer">Logout</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
