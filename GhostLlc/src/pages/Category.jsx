import "../App.css";
import { Link } from "react-router-dom";
import availableAccounts from "../constants"
import CategoryFilter from "./CategoryFilter";
import { AdminIcon } from "../utils";
import { useEffect, useState, useRef } from "react";

const Category = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const carouselRef = useRef(null);

    const filteredAccounts = availableAccounts.filter(account =>
        account.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

        const animation = requestAnimationFrame(scroll)
        return () => cancelAnimationFrame(animation);
    }, []);

    return (
        <div className="p-6">
            <input
                type="text"
                placeholder="Search for an account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 mb-4 border border-gray-300 rounded-md"
            />
            <h1 className="text-2xl font-bold mb-4">Available Game Accounts</h1>
            <div className="carousel-wrapper">
                <div ref={carouselRef} className="carousel-track">
                    {filteredAccounts.length > 0 ? (
                        filteredAccounts.map((account, index) => (
                            <div key={index} className="carousel-item">
                            <img src={account.img} alt={account.title} className="carousel-image" />
                            <h2 className="text-lg text-white font-semibold mt-2">{account.title}</h2>
                            <span className="flex justify-between items-center">
                                <p className="text-gray-400 my-2">{account.views} Total Views</p>
                                <img src={AdminIcon} alt="admin" className="w-8 md:w-10" />
                            </span>
                            <Link to={`/account/${account.slug}`}
                                className="mt-3 inline-block bg-blue-500 text-white px-4 py-2 rounded-md"
                            >
                                View Details
                            </Link>
                        </div>
                        ))
                    ) : (
                        <p className="text-white text-center">
                            No accounts found.
                        </p>
                    )}
                </div>
            </div>

            <h1 className="text-2xl font-bold my-4">Browse By Category</h1>
            <CategoryFilter searchTerm={searchTerm} />
        </div>
    )
}

export default Category