import "../../App.css";
import { Link } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { TbRectangleVerticalFilled } from "react-icons/tb";
import { Gaming_Equips, Gaming_PC, Gaming_Phones, Gift_Packages, Pes5, Phone_Coolers, Xenna } from "../../utils"
import flashSalesProducts from "./flashSalesProducts";
import { useState } from "react";
import productsData from "./categoryData";


const Store = () => {
    return (
        <div className="min-h-screen flex flex-col items-center">
            {/* NavBar Section */}
            <div className="w-full flex justify-between items-center px-12 py-5 bg-[#0E1115]">
                <img src={Xenna} alt="XennaLogo" className="h-10 rounded-md cursor-pointer" />
                <div className="relative w-80">
                    <input
                        type="text"
                        placeholder="What are you looking for?"
                        className="w-full p-2 pl-4 pr-10 bg-gray-800 text-white rounded-lg outline-none border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4426B9]"
                    />
                    <IoSearchOutline className="absolute right-3 top-3 text-gray-400" />
                </div>
            </div>

            {/* Flash Sales Section */}
            <div className="w-full max-w-7xl mt-10 px-5">
                <div className="flex justify-start my-2 gap-2">
                    <TbRectangleVerticalFilled className="text-red-500 self-center w-7 h-7" />
                    <h3 className="text-red-500 text-base font-medium self-center">Top Deals</h3>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl text-white font-bold">Flash Sales</h2>
                    <button className="px-6 py-2 bg-red-500 text-white rounded-lg cursor-pointer">
                        View All Products
                    </button>
                </div>

                <div className="flex overflow-x-auto space-x-4 no-scrollbar">
                    {flashSalesProducts.map((product, id) => (
                        <>
                            <Link to={`/product/${product.slug}`} className="cursor-pointer">
                                <div
                                    key={id}
                                    className="min-w-[280px] text-black p-4 rounded-lg shadow-lg"
                                >
                                    <img src={product.image} alt={product.name} className="w-full h-44 object-cover rounded" />
                                    <h3 className="mt-2 text-sm text-white font-medium">
                                        {product.name}
                                    </h3>
                                    <div className="max-w-fit my-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                        {product.views} views
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        ⭐ {product.rating} reviews
                                    </p>
                                </div>
                            </Link>
                        </>
                    ))}
                </div>
            </div>

            {/* Category Section */}
            <div className="w-full max-w-7xl mt-10 px-5">
                <div className="flex justify-start my-2 gap-2">
                    <TbRectangleVerticalFilled className="text-red-500 self-center w-7 h-7" />
                    <h3 className="text-red-500 text-base font-medium self-center">Categories</h3>
                </div>
                <div className="mb-4">
                    <h2 className="text-2xl text-white font-bold">Browse By Category</h2>
                </div>
                <CategoryFilter />
            </div>

            {/* New Arrival Section */}
            <div className="w-full max-w-7xl mt-10 px-5">
                <div className="flex justify-start my-2 gap-2">
                    <TbRectangleVerticalFilled className="text-red-500 self-center w-7 h-7" />
                    <h3 className="text-red-500 text-base font-medium self-center">Featured</h3>
                </div>
                <div className="mb-4">
                    <h2 className="text-2xl text-white font-bold">New Arrival</h2>
                </div>
                <NewArrivals />
            </div>
        </div>
    )
}

const categories = [
    { id: 1, name: "Cooler", slug: "coolers", image: Phone_Coolers },
    { id: 2, name: "Gaming PC", slug: "gaming-pc", image: Gaming_PC },
    { id: 3, name: "Gaming Equipment", slug: "gaming-equipments", image: Gaming_Equips },
    { id: 4, name: "Gaming Phone", slug: "gaming-phones", image: Gaming_Phones },
    { id: 5, name: "Non-Gamer Package", slug: "non-gamer-gift-packages", image: Gift_Packages }
];

const CategoryFilter = () => {
    const [selectedCategory, setSelectedCategory] = useState("gaming-equipments");

    const selectedCategoryData = productsData.find(cat => cat.slug === selectedCategory);

    const filteredProducts = selectedCategoryData ? selectedCategoryData.products : [];

    return (
        <>
            {/* Category Buttons */}
            <div className="flex justify-center items-center gap-4 overflow-x-auto no-scrollbar">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        className={`w-full px-4 py-2 border rounded-md flex flex-col items-center cursor-pointer ${selectedCategory === category.slug ? 'bg-red-500 text-white' : 'bg-white text-black'
                            }`}
                        onClick={() => setSelectedCategory(category.slug)}
                    >
                        <img src={category.image} alt={category.name} className="w-8 h-8 mb-1" />
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Category Title */}
            <h2 className="text-gray-400 text-xl font-bold mt-10">
                Best Selling {categories.find(c => c.slug === selectedCategory)?.name}s
            </h2>

            {/* Product Listing */}
            <div className="grid grid-cols-4 gap-4 mt-4">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((stock) => (
                        <div key={stock.id} className="border p-4 rounded-lg">
                            <img src={stock.image} alt={stock.name} className="w-full h-40 object-cover" />
                            <h3 className="mt-2 text-sm text-white font-medium">{stock.name}</h3>
                            <div className="max-w-fit my-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                {stock.views} views
                            </div>
                            <p className="text-xs text-gray-500">
                                ⭐ {stock.rating} reviews
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-white text-center col-span-4">No products found for this category.</p>
                )}
            </div>
        </>
    )
};

const NewArrivals = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-black">
            <div className="relative bg-black p-6 rounded-lg flex flex-col justify-end min-h-[300px]">
                <img
                    src={Pes5}
                    alt="Playstation5"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-10">
                    <h2 className="text-xl font-bold text-white">PlayStation 5</h2>
                    <p className="text-gray-400 text-sm">
                        Black and White version of the PS5 coming out on sale.
                    </p>
                    <a href="#" className="inline-block mt-2 text-white border-b">
                        Shop Now
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                
            </div>
        </div>
    )
};

export default Store