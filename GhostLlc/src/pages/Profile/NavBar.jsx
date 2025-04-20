import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../database/firebaseConfig";
import { X, Menu, User, Settings, LogOut } from "lucide-react";
import { NavLogo } from "../../utils";
import {
  IoCartOutline,
  IoHomeOutline, 
  IoGlobeOutline,
  IoWalletOutline,
} from "react-icons/io5";
import { MdOutlinePolicy } from "react-icons/md";
import { HiOutlineFolderOpen } from "react-icons/hi2";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";

const NavBar = ({ profileImage }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setDropdownOpen(false); // Close dropdown
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  // Close dropdown when a link is clicked
  const handleLinkClick = () => {
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 bg-[#0E1115] text-white flex items-center justify-between p-4 shadow-md z-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="hover:cursor-pointer"
      >
        {menuOpen ? <X size={30} /> : <Menu size={30} />}
      </button>

      {/* Mobile Menu */}
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
              <Link
                to="/categories"
                className="flex gap-2 hover:text-gray-400"
                onClick={handleLinkClick}
              >
                Home <IoHomeOutline  className="self-center w-5 h-5" />
              </Link>
            </li>
            <li>
              <Link
                to="/cart"
                className="flex gap-2 hover:text-gray-400"
                onClick={handleLinkClick}
              >
                Cart <IoCartOutline className="self-center w-5 h-5" />
              </Link>
            </li>
            <li>
              <Link
                to="/doc"
                className="flex gap-2 hover:text-gray-400"
                onClick={handleLinkClick}
              >
                Doc <HiOutlineFolderOpen className="self-center w-5 h-5" />
              </Link>
            </li>
            <li>
              <Link
                to="/faqs"
                className="flex gap-2 hover:text-gray-400"
                onClick={handleLinkClick}
              >
                FAQs{" "}
                <HiOutlineQuestionMarkCircle className="self-center w-5 h-5" />
              </Link>
            </li>
            {/* <li>
              <Link
                to="/store"
                className="flex gap-2 hover:text-gray-400"
                onClick={handleLinkClick}
              >
                Store <IoStorefrontOutline className="self-center w-5 h-5" />
              </Link>
            </li> */}
            <li>
              <Link
                to="/community"
                className="flex gap-2 hover:text-gray-400"
                onClick={handleLinkClick}
              >
                Community <IoGlobeOutline className="self-center w-5 h-5" />
              </Link>
            </li>
            <li>
              <Link
                to="/withdraw"
                className="flex gap-2 hover:text-gray-400"
                onClick={handleLinkClick}
              >
                Withdrawal <IoWalletOutline className="self-center w-5 h-5" />
              </Link>
            </li>
            <li>
              <Link
                to="/privacy-policy"
                className="flex gap-2 hover:text-gray-400"
                onClick={handleLinkClick}
              >
                Privacy Policy{" "}
                <MdOutlinePolicy className="self-center w-5 h-5" />
              </Link>
            </li>
          </ul>
        </div>
      )}

      {/* Navbar Logo */}
      <img src={NavLogo} alt="Navbar" className="w-40 h-8 md:h-10 mx-auto" />

      {/* Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="hover:cursor-pointer"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#0576FF]">
            <img
              src={profileImage}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 bg-gray-800 p-4 rounded-lg w-40 shadow-lg z-50">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <User size={16} />
                <Link to="/categories" onClick={handleLinkClick}>
                  Categories
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Settings size={16} />
                <Link to="/settings" onClick={handleLinkClick}>
                  Settings
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <LogOut size={16} />
                <button className="hover:cursor-pointer" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
