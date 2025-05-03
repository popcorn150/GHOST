
import "../App.css";
import { useState, useMemo } from "react";
import categoryAccounts from "../constants/category";
import { Link } from "react-router-dom";
import { AdminIcon } from "../utils";
import PropTypes from "prop-types";
// Define allowed categories, including "Others"
const ALLOWED_CATEGORIES = [
  "Fighting",
  "Shooter",
  "Action",
  "Sport",
  "Adventure",
  "Racing",
  "Others",
];

const CategoryFilter = ({ searchTerm, combinedAccounts, loading }) => {
  const [activeCategory, setActiveCategory] = useState("All");

  // Memoized merged categories with proper account mapping
  const mergedCategories = useMemo(() => {
    const processUploadedAccounts = () => {
      if (!combinedAccounts || !combinedAccounts.length) return [];

      // Initialize category buckets
      const categorizedGames = {};
      ALLOWED_CATEGORIES.forEach((cat) => {
        categorizedGames[cat] = [];
      });

      // Function to determine the appropriate category for an account
      const mapAccountToCategory = (account) => {
        const title = (
          account.title ||
          account.accountName ||
          ""
        ).toLowerCase();
        const existingCategory = (account.category || "").toLowerCase();

        // Prioritize existing category from Firestore if valid
        if (ALLOWED_CATEGORIES.includes(account.category)) {
          return account.category;
        }

        // Normalize legacy categories
        if (existingCategory.includes("fight") || existingCategory === "fighter") {
          return "Fighting";
        }
        if (existingCategory.includes("shoot")) {
          return "Shooter";
        }
        if (existingCategory.includes("sport")) {
          return "Sport";
        }
        if (existingCategory.includes("adventure")) {
          return "Adventure";
        }
        if (existingCategory.includes("action")) {
          return "Action";
        }
        if (
          existingCategory.includes("rac") ||
          existingCategory.includes("driv")
        ) {
          return "Racing";
        }

        // Fallback to title-based inference if no valid category
        if (
          title.includes("fight") ||
          title.includes("combat") ||
          title.includes("battle") ||
          title.includes("wrestling") ||
          title.includes("martial")
        ) {
          return "Fighting";
        }
        if (
          title.includes("shoot") ||
          title.includes("gun") ||
          title.includes("fps")
        ) {
          return "Shooter";
        }
        if (
          title.includes("sport") ||
          title.includes("soccer") ||
          title.includes("basketball") ||
          title.includes("football") ||
          title.includes("tennis")
        ) {
          return "Sport";
        }
        if (
          title.includes("adventure") ||
          title.includes("explore") ||
          title.includes("quest")
        ) {
          return "Adventure";
        }
        if (title.includes("action") || title.includes("mission")) {
          return "Action";
        }
        if (
          title.includes("rac") ||
          title.includes("driv") ||
          title.includes("car") ||
          title.includes("speed")
        ) {
          return "Racing";
        }

        // Default to "Others" if no matches
        return "Others";
      };

      // Process each account and assign to appropriate category
      combinedAccounts.forEach((account) => {
        const category = mapAccountToCategory(account);

        const gameData = {
          title: account.title || account.accountName || "Untitled Account",
          slug: account.slug || account.id || `account-${Date.now()}`,
          img: account.img || account.accountImage || account.images?.accountImage || AdminIcon,
          views: account.views || 0,
          userProfilePic: account.userProfilePic || AdminIcon,
          username: account.username || "Ghost",
          category: category, // Store the mapped category with the game data
          isFromFirestore: account.isFromFirestore || false, // Pass through whether this account was uploaded by the user
        };

        categorizedGames[category].push(gameData);
      });

      // Convert to array format expected by the component
      return ALLOWED_CATEGORIES.map((category) => ({
        name: category,
        games: categorizedGames[category] || [],
      }));
    };

    // Static categories from constants - map Fighter to Fighting
    const staticCategories = categoryAccounts
      .filter((cat) => {
        // Convert "Fighter" category to "Fighting" for comparison
        const categoryName =
          cat.category === "Fighter" ? "Fighting" : cat.category;
        return ALLOWED_CATEGORIES.includes(categoryName);
      })
      .map((cat) => ({
        // Convert "Fighter" to "Fighting" in the result
        name: cat.category === "Fighter" ? "Fighting" : cat.category,
        games: cat.games.map((game) => ({
          ...game,
          isFromFirestore: false, // Mark static accounts as not user-uploaded
        })),
      }));

    // Dynamic categories from uploaded accounts
    const dynamicCategories = processUploadedAccounts();

    // Merge static and dynamic categories
    const combinedCategories = [];
    const categoryMap = {};

    // First add all static categories
    staticCategories.forEach((cat) => {
      if (!categoryMap[cat.name]) {
        categoryMap[cat.name] = { name: cat.name, games: [] };
        combinedCategories.push(categoryMap[cat.name]);
      }
      categoryMap[cat.name].games.push(...cat.games);
    });

    // Then add dynamic categories, merging with existing ones if needed
    dynamicCategories.forEach((cat) => {
      if (!categoryMap[cat.name]) {
        categoryMap[cat.name] = { name: cat.name, games: [] };
        combinedCategories.push(categoryMap[cat.name]);
      }
      categoryMap[cat.name].games.push(...cat.games);
    });

    return combinedCategories;
  }, [combinedAccounts]);

  // Category names - "All" plus the allowed categories
  const categoryNames = useMemo(() => ["All", ...ALLOWED_CATEGORIES], []);

  // Filter games based on search term and active category
  const filteredGames = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    let games = [];

    if (normalizedSearch) {
      // When searching, get games from all categories that match search term
      games = mergedCategories
        .flatMap((category) => category.games)
        .filter((game) => game.title.toLowerCase().includes(normalizedSearch));
    } else {
      if (activeCategory === "All") {
        // Get all games for "All" category
        games = mergedCategories.flatMap((category) => category.games);
      } else {
        // Get games only for the active category
        const category = mergedCategories.find(
          (cat) => cat.name === activeCategory
        );
        games = category ? category.games : [];
      }
    }

    return games;
  }, [searchTerm, activeCategory, mergedCategories]);

  return (
    <div className="p-2 md:p-8">
      {/* Category Buttons */}
      <div className="flex overflow-x-auto gap-5 mb-6 no-scrollbar">
        {categoryNames.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-lg cursor-pointer font-semibold px-6 py-3 transition-all duration-300 ease-in-out
              ${
                activeCategory === category
                  ? "bg-blue-900 text-white shadow-lg"
                  : "bg-gray-200 text-black hover:bg-blue-600 hover:text-white"
              }
              text-sm md:text-base
              flex-shrink-0
              min-w-[120px] md:min-w-[150px] 
              max-w-[250px] md:max-w-[300px]
              whitespace-nowrap`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="category-loader w-16 h-16 rounded-full animate-spin border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Games Grid */}
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
                    onError={(e) => {
                      console.error(`Failed to load image for ${game.title}`);
                      e.target.src = AdminIcon; // Fallback image
                    }}
                  />
                  <h3 className="mt-1 md:mt-2 text-sm md:text-lg font-bold">
                    {game.title}
                  </h3>
                  <div className="flex items-center mt-1 md:mt-2">
                    <img
                      src={game.userProfilePic || AdminIcon}
                      alt="User Profile"
                      className="w-6 h-6 rounded-full object-cover mr-2"
                      onError={(e) => {
                        console.error(
                          `Failed to load profile pic for ${game.title}`
                        );
                        e.target.src = AdminIcon; // Fallback image
                      }}
                    />
                    <p className="text-gray-400 text-xs md:text-sm">
                      By {game.username}
                    </p>
                  </div>
                  <span className="flex justify-between items-center mt-1 md:mt-2">
                    <p className="text-gray-400 text-xs md:text-sm">
                      {game.views} Total Views
                    </p>
                    <p className="text-gray-400 text-xs md:text-sm">
                      {game.category || ""}
                    </p>
                  </span>
                  <div className="flex justify-between items-center mt-2">
                    {/* Only show View Details button for user-uploaded accounts */}
                    {game.isFromFirestore ? (
                      <Link
                        to={`/account/${game.slug}`}
                        className="inline-block bg-blue-500 text-white px-2 py-1 md:px-4 md:py-2 rounded-md text-xs md:text-sm"
                      >
                        View Details
                      </Link>
                    ) : (
                      <div></div> // Empty div to maintain spacing
                    )}
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

CategoryFilter.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  combinedAccounts: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      accountName: PropTypes.string,
      slug: PropTypes.string,
      id: PropTypes.string,
      img: PropTypes.string,
      accountImage: PropTypes.string,
      images: PropTypes.shape({
        accountImage: PropTypes.string,
      }),
      views: PropTypes.number,
      userProfilePic: PropTypes.string,
      username: PropTypes.string,
      category: PropTypes.string,
      isFromFirestore: PropTypes.bool,
    })
  ).isRequired,

}

export default CategoryFilter;
