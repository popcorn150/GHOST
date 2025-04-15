/* eslint-disable react/prop-types */
import "../App.css";
import { useState, useEffect } from "react";
import categoryAccounts from "../constants/category";
import { Link } from "react-router-dom";
import { AdminIcon } from "../utils";
import { FaHeart } from "react-icons/fa6";

const CategoryFilter = ({ searchTerm, combinedAccounts }) => {
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

  // Process uploaded accounts from Firestore to match the category structure
  const processUploadedAccounts = () => {
    if (!combinedAccounts) return [];

    // Create a map to store games by category
    const categorizedGames = {};

    combinedAccounts.forEach((account) => {
      const category = account.category || "Other"; // Use "Other" as default category if none exists
      const gameData = {
        title: account.title || account.accountName || "Untitled Account",
        slug: account.slug || account.id || `account-${Date.now()}`,
        img: account.img || account.accountImage || AdminIcon,
        views: account.views || 0,
      };

      if (!categorizedGames[category]) {
        categorizedGames[category] = [];
      }

      categorizedGames[category].push(gameData);
    });

    // Convert the map to the format expected by the component
    return Object.entries(categorizedGames).map(([name, games]) => ({
      name,
      games,
    }));
  };

  // Combine static category accounts with processed uploaded accounts
  const allCategoryAccounts = [
    ...categoryAccounts,
    ...processUploadedAccounts(),
  ];

  // Merge categories with the same name
  const mergedCategories = allCategoryAccounts.reduce((acc, current) => {
    const existingCategory = acc.find((cat) => cat.name === current.name);
    if (existingCategory) {
      existingCategory.games = [...existingCategory.games, ...current.games];
    } else {
      acc.push(current);
    }
    return acc;
  }, []);

  // Build the list of unique category names
  const categories = [
    "All",
    ...new Set(mergedCategories.map((cat) => cat.name)),
  ];

  // Normalize search term
  const normalizedSearch = searchTerm.toLowerCase().trim();

  // Filter games based on search term or active category
  let filteredGames = [];
  if (normalizedSearch !== "") {
    filteredGames = mergedCategories
      .flatMap((cat) => cat.games)
      .filter((game) => {
        const gameTitle = game.title.toLowerCase();
        return gameTitle.includes(normalizedSearch);
      });
  } else {
    if (activeCategory === "All") {
      filteredGames = mergedCategories.flatMap((cat) => cat.games);
    } else {
      const category = mergedCategories.find(
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
      <div className="flex overflow-x-auto gap-5 mb-6 no-scrollbar">
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
              filteredGames.map((game, index) => (
                <div
                  key={`${game.slug || "game"}-${index}`}
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
                  <div className="flex justify-between items-center mt-2">
                    <Link
                      to={`/account/${game.slug}`}
                      className="inline-block bg-blue-500 text-white px-2 py-1 md:px-4 md:py-2 rounded-md text-xs md:text-sm"
                    >
                      View Details
                    </Link>

                    <button className="cursor-pointer self-center bg-blue-500 text-white px-2 py-1 rounded-md text-xs md:text-sm flex items-center gap-1">
                      <FaHeart className="self-center text-white text-2xl" />
                    </button>
                  </div>
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
