import "../App.css";
import { useState, useEffect, useMemo } from "react";
import categoryAccounts from "../constants/category";
import { Link } from "react-router-dom";
import { AdminIcon } from "../utils";
import PropTypes from "prop-types";
import { db } from "../database/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../components/AuthContext";

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
  const { currentUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [purchasedAccounts, setPurchasedAccounts] = useState([]);
  const [cartAccounts, setCartAccounts] = useState([]);

  // Fetch purchased and cart accounts from Firestore
  useEffect(() => {
    if (!currentUser) {
      setPurchasedAccounts([]);
      setCartAccounts([]);
      return;
    }

    const purchasedQuery = query(
      collection(db, `users/${currentUser.uid}/purchased`)
    );
    const unsubscribePurchased = onSnapshot(
      purchasedQuery,
      (snapshot) => {
        const purchased = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPurchasedAccounts(purchased);
        console.log("Updated purchased accounts:", purchased);
      },
      (error) => {
        console.error("Error fetching purchased accounts:", error);
      }
    );

    const cartQuery = query(collection(db, `users/${currentUser.uid}/cart`));
    const unsubscribeCart = onSnapshot(
      cartQuery,
      (snapshot) => {
        const cart = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCartAccounts(cart);
        console.log("Updated cart accounts:", cart);
      },
      (error) => {
        console.error("Error fetching cart accounts:", error);
      }
    );

    return () => {
      unsubscribePurchased();
      unsubscribeCart();
    };
  }, [currentUser]);

  const isAccountPurchasedOrInCart = (account) => {
    const accountId = account.slug || account.id;
    return (
      purchasedAccounts.some((item) => (item.slug || item.id) === accountId) ||
      cartAccounts.some((item) => (item.slug || item.id) === accountId) ||
      account.sold === true
    );
  };

  const mergedCategories = useMemo(() => {
    const processUploadedAccounts = () => {
      if (!combinedAccounts || !combinedAccounts.length) return [];

      const categorizedGames = {};
      ALLOWED_CATEGORIES.forEach((cat) => {
        categorizedGames[cat] = [];
      });

      const mapAccountToCategory = (account) => {
        const title = (
          account.title ||
          account.accountName ||
          ""
        ).toLowerCase();
        const existingCategory = (account.category || "").toLowerCase();

        if (ALLOWED_CATEGORIES.includes(account.category)) {
          return account.category;
        }

        if (
          existingCategory.includes("fight") ||
          existingCategory === "fighter"
        ) {
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

        return "Others";
      };

      combinedAccounts.forEach((account) => {
        if (isAccountPurchasedOrInCart(account)) {
          return;
        }

        const category = mapAccountToCategory(account);

        let accountImage = AdminIcon;
        if (account.img) {
          accountImage = account.img;
        } else if (account.accountImage) {
          accountImage = account.accountImage;
        } else if (account.images?.accountImage) {
          accountImage = account.images.accountImage;
        }

        let userProfilePic = AdminIcon;
        if (account.userProfilePic) {
          userProfilePic = account.userProfilePic;
        }

        const gameData = {
          title: account.title || account.accountName || "Untitled Account",
          slug: account.slug || account.id || `account-${Date.now()}`,
          img: accountImage,
          views: account.views || 0,
          userProfilePic: userProfilePic,
          username: account.username || "Ghost",
          category: category,
          isFromFirestore: account.isFromFirestore || false,
          sold: account.sold || false,
        };

        console.log(`Processing account: ${gameData.title}, Image: ${accountImage}, Profile: ${userProfilePic}`);

        categorizedGames[category].push(gameData);
      });

      return ALLOWED_CATEGORIES.map((category) => ({
        name: category,
        games: categorizedGames[category] || [],
      }));
    };

    const staticCategories = categoryAccounts
      .filter((cat) => {
        const categoryName =
          cat.category === "Fighter" ? "Fighting" : cat.category;
        return ALLOWED_CATEGORIES.includes(categoryName);
      })
      .map((cat) => ({
        name: cat.category === "Fighter" ? "Fighting" : cat.category,
        games: cat.games
          .filter((game) => !isAccountPurchasedOrInCart(game))
          .map((game) => ({
            ...game,
            isFromFirestore: false,
            sold: false,
          })),
      }));

    const dynamicCategories = processUploadedAccounts();

    const combinedCategories = [];
    const categoryMap = {};

    staticCategories.forEach((cat) => {
      if (!categoryMap[cat.name]) {
        categoryMap[cat.name] = { name: cat.name, games: [] };
        combinedCategories.push(categoryMap[cat.name]);
      }
      categoryMap[cat.name].games.push(...cat.games);
    });

    dynamicCategories.forEach((cat) => {
      if (!categoryMap[cat.name]) {
        categoryMap[cat.name] = { name: cat.name, games: [] };
        combinedCategories.push(categoryMap[cat.name]);
      }
      categoryMap[cat.name].games.push(...cat.games);
    });

    return combinedCategories;
  }, [combinedAccounts, purchasedAccounts, cartAccounts]);

  const categoryNames = useMemo(() => ["All", ...ALLOWED_CATEGORIES], []);

  const filteredGames = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    let games = [];

    if (normalizedSearch) {
      games = mergedCategories
        .flatMap((category) => category.games)
        .filter((game) => game.title.toLowerCase().includes(normalizedSearch));
    } else {
      if (activeCategory === "All") {
        games = mergedCategories.flatMap((category) => category.games);
      } else {
        const category = mergedCategories.find(
          (cat) => cat.name === activeCategory
        );
        games = category ? category.games : [];
      }
    }

    return games;
  }, [searchTerm, activeCategory, mergedCategories]);

  return (
    <div className="px-0 md:px-4 py-2 md:py-8"> {/* Further reduced from px-1 md:px-6 to px-0 md:px-4 */}
      <div className="flex overflow-x-auto gap-3 mb-6 no-scrollbar"> {/* Further reduced from gap-4 to gap-3 */}
        {categoryNames.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-lg cursor-pointer font-semibold px-6 py-3 transition-all duration-300 ease-in-out
              ${
                activeCategory === category
                  ? "bg-blue-900 text-white"
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

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="category-loader w-16 h-16 rounded-full animate-spin border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"> {/* Further reduced from gap-3 to gap-2 */}
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
                    console.error(`Failed to load image for ${game.title}:`, e.target.src);
                    e.target.src = AdminIcon;
                  }}
                  onLoad={() => {
                    console.log(`Successfully loaded image for ${game.title}:`, game.img);
                  }}
                />
                <h3 className="mt-2 text-sm md:text-lg font-bold">
                  {game.title}
                </h3>
                <div className="flex items-center mt-2">
                  <img
                    src={game.userProfilePic || AdminIcon}
                    alt="User Profile"
                    className="w-6 h-6 rounded-full object-cover mr-2"
                    onError={(e) => {
                      console.error(`Failed to load profile pic for ${game.title}:`, e.target.src);
                      e.target.src = AdminIcon;
                    }}
                  />
                  <p className="text-gray-400 text-xs md:text-sm">
                    By {game.username}
                  </p>
                </div>
                <span className="flex justify-between items-center mt-2">
                  <p className="text-gray-400 text-xs md:text-sm">
                    {game.views} Total Views
                  </p>
                  <p className="text-gray-400 text-xs md:text-sm">
                    {game.category || ""}
                  </p>
                </span>
                <div className="flex justify-between items-center mt-2">
                  {game.isFromFirestore ? (
                    <Link
                      to={`/account/${game.slug}`}
                      className="inline-block bg-blue-500 text-white px-2 py-1 md:px-4 md:py-2 rounded-md text-xs md:text-sm hover:bg-blue-600 transition-colors"
                    >
                      View Details
                    </Link>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-white text-center col-span-3">No games found.</p>
          )}
        </div>
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
      sold: PropTypes.bool,
    })
  ).isRequired,
};

export default CategoryFilter;