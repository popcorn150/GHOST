import { useState } from "react";
import { Link } from "react-router-dom";
import { X, Menu, User, Settings, LogOut } from "lucide-react";
import { NavLogo, ProfileIcon } from "../../utils";

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handler to close dropdown when a link is clicked
  const handleLinkClick = () => {
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  return (
    <nav className="bg-[#0E1115] text-white flex items-center justify-between p-4 relative">
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
            {/* Link for Categories in mobile menu */}
            <li>
              <Link
                to="/categories"
                className="hover:text-gray-400"
                onClick={handleLinkClick}
              >
                Categories
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="hover:text-gray-400"
                onClick={handleLinkClick}
              >
                Cart
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="hover:text-gray-400"
                onClick={handleLinkClick}
              >
                Notifications
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="hover:text-gray-400"
                onClick={handleLinkClick}
              >
                Community
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="hover:text-gray-400"
                onClick={handleLinkClick}
              >
                Withdrawal
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
                <User size={16} />{" "}
                <Link to="/categories" onClick={handleLinkClick}>
                  Categories
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Settings size={16} />{" "}
                <Link to="/settings" onClick={handleLinkClick}>
                  Settings
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <LogOut size={16} />{" "}
                <button
                  className="hover:cursor-pointer"
                  onClick={handleLinkClick}
                >
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
