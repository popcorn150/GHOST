import { useState } from "react"
import categoryAccounts from "../constants/category";
import { Link } from "react-router-dom";
import { AdminIcon } from "../utils";


const CategoryFilter = () => {
    const [activeCategory, setActiveCategory] = useState("All");

    // Get unique category names
    const categories = ["All", ...categoryAccounts.map((cat) => cat.name)];

    // Filter games based on active category
    const filteredGames =
        activeCategory === "All"
            ? categoryAccounts.flatMap((cat) => cat.games)
            : categoryAccounts.find((cat) => cat.name === activeCategory)?.games || [];

    return (
        <>
            <div className="flex space-x-2 mb-4">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full cursor-pointer font-semibold ${activeCategory === category ? "bg-blue-900 text-white" : "bg-gray-200 text-black"
                            }`}>
                        {category}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGames.map((game) => (
                    <div key={game.slug} className="p-2 rounded-lg bg-[#18202D] text-white shadow-lg hover:shadow-xl">
                        <img src={game.img} alt={game.title} className="w-full h-40 object-cover rounded-lg" />
                        <h3 className="mt-2 text-lg font-bold">{game.title}</h3>
                        <span className="flex justify-between items-center">
                            <p className="text-gray-400 my-2">{game.views} Total Views</p>
                            <img src={AdminIcon} alt="admin" className="w-8 md:w-10" />
                        </span>
                        <Link to={`/account/${game.slug}`}
                            key={game.slug}
                            className="mt-3 inline-block bg-blue-500 text-white px-4 py-2 rounded-md"
                        >
                            View Details
                        </Link>
                    </div>
                ))}
            </div>
        </>
    )
}

export default CategoryFilter