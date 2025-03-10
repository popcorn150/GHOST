import "../App.css";
import { Link } from "react-router-dom";
import availableAccounts from "../constants";
import CategoryFilter from "./CategoryFilter";
import { AdminIcon } from "../utils";
import { useEffect, useState, useRef } from "react";
import NavBar from "../components/NavBar";

const Category = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const carouselRef = useRef(null);

  // Filter the accounts based on the search term.
  const filteredAccounts = availableAccounts.filter((account) =>
    account.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Duplicate the filtered accounts so that when the first set finishes scrolling,
  // the second set is immediately available for a seamless loop.
  const duplicatedAccounts = [...filteredAccounts, ...filteredAccounts];

  // Auto-scroll logic using a transform.
  useEffect(() => {
    let scrollAmount = 0;
    const speed = 1.5; // Adjust scrolling speed as needed

    const scroll = () => {
      if (carouselRef.current) {
        scrollAmount += speed;
        // Reset when we've scrolled one full set of items (half the total scrollWidth)
        if (scrollAmount >= carouselRef.current.scrollWidth / 2) {
          scrollAmount = 0;
        }
        carouselRef.current.style.transform = `translateX(-${scrollAmount}px)`;
      }
      requestAnimationFrame(scroll);
    };

    const animation = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animation);
  }, [duplicatedAccounts]);

  return (
    <>
      <NavBar />
      <div className="p-6">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search for an account..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-4 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
        />

        {/* Carousel */}
        <h1 className="text-2xl text-white font-semibold mb-4">
          Featured Game Accounts
        </h1>
        <div className="carousel-wrapper overflow-hidden">
          <div
            ref={carouselRef}
            className="carousel-track flex"
            style={{ whiteSpace: "nowrap" }}
          >
            {duplicatedAccounts.map((account, index) => (
              <div
                key={index}
                className="carousel-item inline-block"
                style={{ flexShrink: 0 }}
              >
                <img
                  src={account.img}
                  alt={account.title}
                  className="carousel-image"
                />
                {/* Title wrapped in container with fixed width and truncate */}
                <div className="w-48">
                  <h2 className="text-lg text-white font-semibold mt-2 truncate">
                    {account.title}
                  </h2>
                </div>
                <span className="flex justify-between items-center">
                  <p className="text-gray-400 my-2">
                    {account.views} Total Views
                  </p>
                  <img src={AdminIcon} alt="admin" className="w-8 md:w-10" />
                </span>
                <Link
                  to={`/account/${account.slug}`}
                  className="mt-3 inline-block bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Category Section */}
        <h1 className="text-2xl text-white font-bold my-4">
          Browse By Category
        </h1>
        <CategoryFilter
          key={searchTerm.trim() === "" ? "default" : "active"}
          searchTerm={searchTerm}
        />
      </div>
    </>
  );
};

export default Category;
