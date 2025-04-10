import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import CategoryFilter from "./CategoryFilter";
import { AdminIcon } from "../utils";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../database/firebaseConfig";
import availableAccounts from "../constants";

const Category = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadedAccounts, setUploadedAccounts] = useState([]);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchUploadedAccounts = async () => {
      try {
        const accountsRef = collection(db, "accounts");
        const querySnapshot = await getDocs(accountsRef);
        const accounts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched uploaded accounts:", accounts);
        setUploadedAccounts(accounts);
      } catch (error) {
        console.error(
          "Error fetching uploaded accounts:",
          error.code,
          error.message
        );
        setUploadedAccounts([]);
      }
    };

    fetchUploadedAccounts();
  }, []);

  const combinedAccounts = [...availableAccounts, ...uploadedAccounts];
  console.log("Combined accounts:", combinedAccounts); // Debug

  const filteredAccounts = combinedAccounts.filter((account) => {
    const title = account.title || account.accountName || "";
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const duplicatedAccounts = [...filteredAccounts, ...filteredAccounts];

  useEffect(() => {
    let scrollAmount = 0;
    const speed = 1.5;

    const scroll = () => {
      if (carouselRef.current) {
        scrollAmount += speed;
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
      <div className="p-5">
        <input
          type="text"
          placeholder="Search for an account..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-4 bg-[#161B22] text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
        />

        <h1 className="text-2xl text-white font-semibold mb-4">
          Featured Game Accounts
        </h1>
        <div className="carousel-wrapper overflow-hidden">
          <div
            ref={carouselRef}
            className="carousel-track flex"
            style={{ whiteSpace: "nowrap" }}
          >
            {duplicatedAccounts.map((account, index) => {
              const imageSrc = account.img || account.accountImage || AdminIcon;
              return (
                <div
                  key={index}
                  className="carousel-item inline-block"
                  style={{ flexShrink: 0 }}
                >
                  <img
                    src={imageSrc}
                    alt={account.title || account.accountName || "Untitled"}
                    className="carousel-image"
                    onError={() =>
                      console.error(
                        `Failed to load image for ${
                          account.title || account.accountName
                        }, src: ${imageSrc}`
                      )
                    }
                    onLoad={() =>
                      console.log(
                        `Loaded image for ${
                          account.title || account.accountName
                        }`
                      )
                    }
                  />
                  <div className="w-48">
                    <h2 className="text-lg text-white font-semibold mt-2 truncate">
                      {account.title || account.accountName || "Untitled"}
                    </h2>
                    {/* Display username if available */}
                    <p className="text-gray-400 text-sm">
                      {account.username
                        ? `By ${account.username}`
                        : "By Unknown"}
                    </p>
                  </div>
                  <span className="flex justify-between items-center">
                    <p className="text-gray-400 my-2">
                      {account.views || 0} Total Views
                    </p>
                    <img src={AdminIcon} alt="admin" className="w-8 md:w-10" />
                  </span>
                  <Link
                    to={`/account/${account.slug || account.id}`}
                    className="mt-3 inline-block bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    View Details
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <h1 className="text-2xl text-white font-bold my-4">
          Browse By Category
        </h1>
        <CategoryFilter
          key={searchTerm.trim() === "" ? "default" : "active"}
          searchTerm={searchTerm}
          combinedAccounts={combinedAccounts}
        />
      </div>
    </>
  );
};

export default Category;
