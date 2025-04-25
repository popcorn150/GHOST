import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Menu, User, Settings, LogOut } from "lucide-react";
import { NavLogo, ProfileIcon } from "../../utils";
import { IoCartOutline } from "react-icons/io5";
import { IoGlobeOutline } from "react-icons/io5";
import { IoWalletOutline } from "react-icons/io5";
import { MdOutlinePolicy } from "react-icons/md";
import { HiOutlineFolderOpen } from "react-icons/hi2";
import { IoHomeOutline } from "react-icons/io5";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";
import { useAuth } from "../../components/AuthContext";
import { toast, Toaster } from "sonner";

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Navigation links for authenticated users
  const authLinks = [
    { to: "/categories", label: "Home", icon: IoHomeOutline },
    { to: "/cart", label: "Cart", icon: IoCartOutline },
    { to: "/doc", label: "Doc", icon: HiOutlineFolderOpen },
    { to: "/faqs", label: "FAQs", icon: HiOutlineQuestionMarkCircle },
    { to: "/community", label: "Community", icon: IoGlobeOutline },
    { to: "/withdraw", label: "Withdrawal", icon: IoWalletOutline },
    { to: "/privacy-policy", label: "Privacy Policy", icon: MdOutlinePolicy },
  ];

  // Navigation links for unauthenticated visitors
  const visitorLinks = [
    { to: "/privacy-policy", label: "Privacy Policy", icon: MdOutlinePolicy },
    { to: "/doc", label: "Doc", icon: HiOutlineFolderOpen },
    { to: "/faqs", label: "FAQs", icon: HiOutlineQuestionMarkCircle },
  ];

  // Select links based on authentication status
  const navLinks = currentUser ? authLinks : visitorLinks;

  const handleLinkClick = (to, label) => {
    if (!currentUser) {
      toast.error(`Please log in to view ${label}.`);
      navigate("/login");
    } else {
      navigate(to);
    }
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 bg-[#0E1115] text-white flex items-center justify-between p-4 shadow-md z-50">
      <Toaster richColors position="top-center" />
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="hover:cursor-pointer"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        {menuOpen ? <X size={30} /> : <Menu size={30} />}
      </button>

      {menuOpen && (
        <div className="fixed inset-0 bg-[#0E1115] bg-opacity-80 z-50 flex flex-col w-64 p-6">
          <button
            onClick={() => setMenuOpen(false)}
            className="self-end mb-4 cursor-pointer"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
          <ul className="space-y-4">
            {navLinks.map((link) => (
              <li key={link.to}>
                <button
                  onClick={() => handleLinkClick(link.to, link.label)}
                  className="flex gap-2 hover:text-gray-400 w-full text-left"
                  aria-label={`Navigate to ${link.label}`}
                >
                  {link.label}
                  <link.icon className="self-center w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <img
        src={NavLogo}
        alt="Navbar Logo"
        className="w-40 h-8 md:h-10 mx-auto"
      />

      <div className="relative">
        {currentUser ? (
          <>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="hover:cursor-pointer"
              aria-label="Toggle profile menu"
            >
              <img
                src={ProfileIcon}
                alt="Profile"
                className="w-14 items-center rounded-lg"
              />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 bg-gray-800 p-4 rounded-lg w-40 shadow-lg">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <IoHomeOutline size={16} />
                    <Link to="/categories" onClick={() => setDropdownOpen(false)}>
                      Home
                    </Link>
                  </li>
                  <li
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => {
                      navigate("/settings");
                      setDropdownOpen(false);
                    }}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </li>
                  <li
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => {
                      navigate("/login"); // Replace with actual logout logic
                      setDropdownOpen(false);
                    }}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </li>
                </ul>
              </div>
            )}
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 hover:text-gray-400"
            aria-label="Log in"
          >
            <img
              src={ProfileIcon}
              alt="Login"
              className="w-14 items-center rounded-lg"
            />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
