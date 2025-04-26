import { useState, useEffect } from "react";
import { db } from "../../database/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { FaImage } from "react-icons/fa";

const Uploads = ({ profileImage, userId }) => {
  const [uploadedAccounts, setUploadedAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");

  // Fetch the visited user's uploaded accounts and username
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoading(true);

        // Fetch username
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().username) {
          setUsername(userDocSnap.data().username);
        } else {
          setUsername("Unnamed User");
        }

        // Fetch accounts
        const q = query(
          collection(db, "accounts"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const accounts = [];
        for (const docSnap of querySnapshot.docs) {
          const accountData = { id: docSnap.id, ...docSnap.data() };
          try {
            const imagesRef = collection(db, `accounts/${docSnap.id}/images`);
            const imagesSnap = await getDocs(imagesRef);
            const images = {};
            imagesSnap.forEach((imgDoc) => {
              images[imgDoc.id] = imgDoc.data().image || null;
            });
            accounts.push({ ...accountData, images });
          } catch (error) {
            console.error(
              `Error fetching images for account ${docSnap.id}:`,
              error
            );
            accounts.push({ ...accountData, images: {} });
          }
        }
        setUploadedAccounts(accounts);
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setUploadedAccounts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchAccounts();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-l-4 border-r-4 border-t-[#0576FF] border-b-[#0576FF] border-l-transparent border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 bg-gradient-to-br from-[#0E1115] via-[#1A1F29] to-[#252A36] rounded-2xl border border-gray-800">
      <h2 className="text-gray-100 text-lg sm:text-2xl lg:text-3xl font-semibold tracking-wider mb-6 lg:mb-10">
        Accounts Uploaded
      </h2>
      {uploadedAccounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 lg:gap-8">
          {uploadedAccounts.map((acc) => (
            <div
              key={acc.id}
              className="relative bg-[#161B22]/80 p-4 rounded-xl shadow-lg border border-gray-800 active:scale-95 transition-all duration-300 group"
            >
              <div className="flex items-center mb-4">
                <img
                  src={profileImage || "/default-profile.png"}
                  alt="User Profile"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#0576FF]/60 mr-3 object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-gray-100 text-sm md:text-lg font-medium tracking-wider truncate">
                    {acc.accountName}
                  </h3>
                  <p className="text-gray-400 text-xs md:text-sm tracking-wider">
                    <span className="text-[#0576FF] font-bold">
                      Uploaded by:
                    </span>{" "}
                    {username}
                  </p>
                </div>
              </div>

              {acc.images?.accountImage ? (
                <div className="relative overflow-hidden rounded-lg mb-4 group/image">
                  <img
                    src={acc.images.accountImage}
                    alt={acc.accountName}
                    className="w-full h-36 sm:h-40 md:h-44 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover/image:scale-105"
                    style={{ aspectRatio: "16/9" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>
                </div>
              ) : (
                <div className="w-full h-36 sm:h-40 md:h-44 bg-gradient-to-br from-[#1A1F29] to-[#252A36] flex items-center justify-center rounded-lg shadow-md mb-4">
                  <FaImage className="text-gray-500 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  <p className="text-gray-500 text-xs sm:text-sm font-light tracking-wider ml-2">
                    No Image
                  </p>
                </div>
              )}

              <div className="space-y-2 mb-4">
                <p className="text-gray-200 text-xs md:text-sm tracking-wider">
                  <span className="text-[#0576FF] font-bold">
                    Credential:
                  </span>{" "}
                  <span className="text-xs">{acc.accountCredential}</span>
                </p>
                <p className="text-gray-200 text-xs sm:text-sm tracking-wider">
                  <span className="text-[#0576FF] font-bold">
                    Worth:
                  </span>{" "}
                  <span className="font-medium">
                    {acc.accountWorth} ({acc.currency || "USD"})
                  </span>
                </p>
                <p className="text-gray-200 text-xs sm:text-sm tracking-wider line-clamp-2">
                  <span className="text-[#0576FF] font-bold">
                    Description:
                  </span>{" "}
                  <span className="font-light">{acc.accountDescription}</span>
                </p>
              </div>

              {acc.images &&
              Object.keys(acc.images).filter((key) =>
                key.startsWith("screenshot")
              ).length > 0 ? (
                <div className="mb-2">
                  <p className="text-gray-200 text-xs md:text-sm font-light uppercase tracking-wider mb-2">
                    Screenshots:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(acc.images)
                      .filter((key) => key.startsWith("screenshot"))
                      .map((key, index) =>
                        acc.images[key] ? (
                          <div
                            key={index}
                            className="relative group/screenshot"
                          >
                            <img
                              src={acc.images[key]}
                              alt={`Screenshot ${index + 1}`}
                              className="w-full h-16 md:h-20 object-cover rounded-md shadow-sm transition-transform duration-300 group-hover/screenshot:scale-105"
                              style={{ aspectRatio: "4/3" }}
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/screenshot:opacity-100 transition-opacity duration-300 rounded-md"></div>
                          </div>
                        ) : (
                          <div
                            key={index}
                            className="w-full h-16 md:h-20 bg-gradient-to-br from-[#1A1F29] to-[#252A36] flex items-center justify-center rounded-md shadow-sm"
                          >
                            <FaImage className="text-gray-500 w-4 h-4 md:w-6 md:h-6" />
                          </div>
                        )
                      )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-xs md:text-sm font-normal tracking-wider mb-2">
                  No screenshots available.
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center text-sm md:text-base font-normal tracking-wider">
          No accounts uploaded by this user.
        </p>
      )}
    </div>
  );
};

export default Uploads;
