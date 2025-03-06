import { useState, useEffect } from "react";
import categoryAccounts from "../constants/category";
import { Link } from "react-router-dom";
import { AdminIcon } from "../utils";

const CategoryFilter = ({ searchTerm }) => {
  const [activeCategory, setActiveCategory] = useState("All");

  // Build the list of unique category names.
  const categories = [
    "All",
    ...new Set(categoryAccounts.map((cat) => cat.name)),
  ];

  // Normalize search term
  const normalizedSearch = searchTerm.toLowerCase().trim();

  // If a search term is entered, filter across ALL games.
  // Otherwise, filter by the active category.
  let filteredGames = [];
  if (normalizedSearch !== "") {
    // Combine all games from every category and filter them.
    filteredGames = categoryAccounts
      .flatMap((cat) => cat.games)
      .filter((game) => game.title.toLowerCase().includes(normalizedSearch));
  } else {
    // No search term: filter by active category.
    if (activeCategory === "All") {
      filteredGames = categoryAccounts.flatMap((cat) => cat.games);
    } else {
      const category = categoryAccounts.find(
        (cat) => cat.name === activeCategory
      );
      filteredGames = category ? category.games : [];
    }
  }

  // When the search term is cleared, reset activeCategory to "All"
  useEffect(() => {
    if (normalizedSearch === "") {
      setActiveCategory("All");
    }
  }, [normalizedSearch]);

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full cursor-pointer font-semibold ${
              activeCategory === category
                ? "bg-blue-900 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <div
              key={game.slug}
              className="p-2 rounded-lg bg-[#18202D] text-white shadow-lg hover:shadow-xl"
            >
              <img
                src={game.img}
                alt={game.title}
                className="w-full h-40 object-cover rounded-lg"
              />
              <h3 className="mt-2 text-lg font-bold">{game.title}</h3>
              <span className="flex justify-between items-center">
                <p className="text-gray-400 my-2">{game.views} Total Views</p>
                <img src={AdminIcon} alt="admin" className="w-8 md:w-10" />
              </span>
              <Link
                to={`/account/${game.slug}`}
                className="mt-3 inline-block bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                View Details
              </Link>
            </div>
          ))
        ) : (
          <p className="text-white text-center">No games found.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryFilter;
