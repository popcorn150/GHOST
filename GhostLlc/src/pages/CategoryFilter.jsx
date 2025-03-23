/* eslint-disable react/prop-types */
import "../App.css";
import { useState, useEffect } from "react";
import categoryAccounts from "../constants/category";
import { Link } from "react-router-dom";
import { AdminIcon } from "../utils";

const CategoryFilter = ({ searchTerm }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  // Build the list of unique category names.
  const categories = [
    "All",
    ...new Set(categoryAccounts.map((cat) => cat.name)),
  ];

  // Normalize search term
  const normalizedSearch = searchTerm.toLowerCase().trim();

  // Filter games based on search term or active category.
  let filteredGames = [];
  if (normalizedSearch !== "") {
    filteredGames = categoryAccounts
      .flatMap((cat) => cat.games)
      .filter((game) => game.title.toLowerCase().includes(normalizedSearch));
  } else {
    if (activeCategory === "All") {
      filteredGames = categoryAccounts.flatMap((cat) => cat.games);
    } else {
      const category = categoryAccounts.find(
        (cat) => cat.name === activeCategory
      );
      filteredGames = category ? category.games : [];
    }
  }

  // When search term is cleared, reset activeCategory to "All"
  useEffect(() => {
    if (normalizedSearch === "") {
      setActiveCategory("All");
    }
  }, [normalizedSearch]);

  return (
    <div className="p-2 md:p-8">
      {/* Category Buttons */}
      <div className="flex overflow-x-auto  gap-5 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`rounded-full cursor-pointer font-semibold 
              ${activeCategory === category
                ? "bg-blue-900 text-white"
                : "bg-gray-200 text-black"
              }
              px-10 py-3`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="category-loader w-24 h-24 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <div
                  key={game.slug}
                  className="p-2 md:p-2 rounded-lg bg-[#18202D] text-white shadow-lg hover:shadow-xl"
                >
                  <img
                    src={game.img}
                    alt={game.title}
                    className="w-full h-24 md:h-40 object-cover rounded-lg"
                  />
                  <h3 className="mt-1 md:mt-2 text-sm md:text-lg font-bold">
                    {game.title}
                  </h3>
                  <span className="flex justify-between items-center">
                    <p className="text-gray-400 my-1 md:my-2 text-xs md:text-sm">
                      {game.views} Total Views
                    </p>
                    <img src={AdminIcon} alt="admin" className="w-6 md:w-8" />
                  </span>
                  <Link
                    to={`/account/${game.slug}`}
                    className="mt-2 inline-block bg-blue-500 text-white px-2 py-1 md:px-4 md:py-2 rounded-md text-xs md:text-sm"
                  >
                    View Details
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-white text-center">No games found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryFilter;
