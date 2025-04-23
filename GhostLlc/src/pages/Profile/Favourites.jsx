import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../database/firebaseConfig";
import { FaImage, FaStar } from "react-icons/fa";

const Favorites = ({ userId }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (userId) {
        try {
          setIsLoading(true);
          const userDocRef = doc(db, "users", userId);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data().favorites) {
            const favoritesIds = userDoc.data().favorites;
            const favoritesData = [];

            for (const id of favoritesIds) {
              const accountDocRef = doc(db, "accounts", id);
              const accountDoc = await getDoc(accountDocRef);

              if (accountDoc.exists()) {
                const imagesRef = collection(db, `accounts/${id}/images`);
                const imagesSnap = await getDocs(imagesRef);
                const images = {};

                imagesSnap.forEach((imgDoc) => {
                  images[imgDoc.id] = imgDoc.data().image || null;
                });

                favoritesData.push({
                  id,
                  ...accountDoc.data(),
                  images,
                });
              }
            }

            setFavorites(favoritesData);
          }
        } catch (error) {
          console.error("Error fetching favorites:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchFavorites();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-l-4 border-r-4 border-t-[#0576FF] border-b-[#0576FF] border-l-transparent border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h2 className="text-white text-xl font-semibold mb-6">
        Favorite Accounts
      </h2>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="bg-[#161B22] p-4 rounded-xl border border-gray-800 relative"
            >
              <div className="flex items-center mb-4">
                <div className="flex-1">
                  <h3 className="text-gray-100 text-lg font-medium truncate">
                    {favorite.accountName}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    <span className="text-[#0576FF]">By:</span>{" "}
                    {favorite.username || "Unknown"}
                  </p>
                </div>
              </div>

              {favorite.images?.accountImage ? (
                <div className="mb-4">
                  <img
                    src={favorite.images.accountImage}
                    alt={favorite.accountName}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-gray-800 flex items-center justify-center rounded-lg mb-4">
                  <FaImage className="text-gray-500 w-8 h-8" />
                </div>
              )}

              <div className="space-y-2">
                <p className="text-gray-200 text-sm">
                  <span className="text-[#0576FF] font-light uppercase text-xs">
                    Credential:
                  </span>{" "}
                  <span className="font-medium">
                    {favorite.accountCredential}
                  </span>
                </p>
                <p className="text-gray-200 text-sm">
                  <span className="text-[#0576FF] font-light uppercase text-xs">
                    Worth:
                  </span>{" "}
                  <span className="font-medium">
                    {favorite.accountWorth} ({favorite.currency || "USD"})
                  </span>
                </p>
                <p className="text-gray-200 text-xs line-clamp-2">
                  <span className="text-[#0576FF] font-light uppercase text-xs">
                    Description:
                  </span>{" "}
                  {favorite.accountDescription}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <FaStar className="text-gray-400 text-4xl mb-4" />
          <p className="text-gray-400 text-center">
            This user hasn't added any accounts to their favorites.
          </p>
        </div>
      )}
    </div>
  );
};

export default Favorites;
