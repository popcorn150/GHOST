import "../../App.css";
import { Link } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { TbRectangleVerticalFilled } from "react-icons/tb";
import {
    Controller,
    Echo_Speakers,
    Gaming_Equips,
    Gaming_PC, 
    Gaming_Phones, 
    Gift_Packages, 
    i3_Gaming_Laptop, JBL,
    Pes5Slim, 
    Phone_Coolers,
    Xenna
} from "../../utils"
import flashSalesProducts from "./flashSalesProducts";
import { useEffect, useState } from "react";
import productsData from "./categoryData";
import NavBar from "../Profile/NavBar";


const Store = () => {
    return (
        <>
            <NavBar />

            <div className="min-h-screen flex flex-col items-center">
                {/* NavBar Section */}
                <div className="w-full flex justify-between items-center mt-2 px-12 py-5 bg-[#0E1115]">
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

                {/* Carousel Section */}
                <div className="w-full max-w-7xl mt-10 px-5">
                    <Carousel />
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

                {/* Unique Section */}
                <div className="w-full max-w-7xl rounded-md mt-10 px-20 py-10 md:py-16 lg:py-20 bg-[#161B22] text-white">
                    <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="text-center md:text-left">
                            <p className="text-green-500 text-sm font-semibold">
                                Premium JBL
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold mt-2">
                                Enhance Your Listening Experience
                            </h2>
                            <button className="mt-6 px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 cursor-pointer">
                                Buy Now!
                            </button>
                        </div>
                        {/* Right Side */}
                        <div className="flex justify-center">
                            <img
                                src={JBL}
                                alt="JBL Speaker"
                                className="max-w-full h-80 rounded-lg"
                            />
                        </div>
                    </div>
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
        </>
    )
};

const careouselImages = [
    { id: 1, image: Pes5Slim, info: "Up to 10% off Vouchers on selected items" },
    { id: 2, image: i3_Gaming_Laptop, info: "Up to 20% off Vouchers on selected items" },
    { id: 3, image: Controller, info: "Up to 30% off Vouchers on selected items" },
    { id: 4, image: Echo_Speakers, info: "Up to 40% off Vouchers on selected items" },
    { id: 5, image: JBL, info: "Up to 50% off Vouchers on selected items" }
];

const Carousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % careouselImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-64 overflow-hidden bg-black flex items-center">
            {careouselImages.map((item, index) => (
                <div
                    key={item.id}
                    className={`absolute w-full flex items-center justify-between px-10 transition-transform duration-700 ${index === currentIndex ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                        }`}
                >
                    <div className="text-white">
                        <h2 className="text-2xl font-bold">{item.info}</h2>
                        <a href="#" className="mt-2 inline-block text-white border-b">Shop Now</a>
                    </div>
                    <img src={item.image} alt="carousel" className="h-[250px] object-contain" />
                </div>
            ))}
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {careouselImages.map((_, index) => (
                    <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-red-500' : 'bg-gray-500'
                            }`}
                    ></div>
                ))}
            </div>
        </div>
    )
};

const categories = [
    { id: 1, name: "Cooler", slug: "coolers", image: Phone_Coolers },
    { id: 2, name: "Gaming PC", slug: "gaming-pc", image: Gaming_PC },
    { id: 3, name: "Gaming Equipment", slug: "gaming-equipments", image: Gaming_Equips },
    { id: 4, name: "Gaming Phone", slug: "gaming-phones", image: Gaming_Phones },
    { id: 5, name: "Non-Gamer", slug: "non-gamer-gift-packages", image: Gift_Packages }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div className="relative bg-[#161B22] p-6 rounded-lg flex flex-col justify-end min-h-[300px] overflow-hidden">
                <img
                    src={Pes5Slim}
                    alt="PlayStation 5"
                    className="absolute inset-0 w-full h-full object-contain"
                />
                <div className="relative z-10">
                    <h2 className="text-xl font-bold text-white">PlayStation 5</h2>
                    <p className="text-gray-300 text-sm">
                        Black and White version of the PS5 coming out on sale.
                    </p>
                    <a href="#" className="inline-block mt-2 text-white border-b">
                        Shop Now
                    </a>
                </div>
            </div>

            <div className="grid grid-rows-2 grid-cols-2 gap-4">
                <div className="relative bg-[#161B22] p-6 rounded-lg flex flex-col justify-end row-span-2 overflow-hidden">
                    <img
                        src={Echo_Speakers}
                        alt="Echo Speakers"
                        className="absolute py-5 inset-0 w-full h-full object-contain"
                    />
                    <div className="relative z-10">
                        <h2 className="text-lg text-white font-bold">Echo Speakers</h2>
                        <p className="text-gray-400 text-sm">
                            Featured women&apos;s collections that give you another vibe.
                        </p>
                        <a href="#" className="inline-block mt-2 text-white border-b">
                            Shop Now
                        </a>
                    </div>
                </div>

                {/* Speakers */}
                <div className="relative bg-[#161B22] p-6 rounded-lg flex flex-col justify-end min-h-[150px] overflow-hidden">
                    <img
                        src={Controller}
                        alt="Speakers"
                        className="absolute py-3 inset-0 w-full h-full object-contain"
                    />
                    <div className="relative z-10">
                        <h2 className="text-lg font-bold text-white">Speakers</h2>
                        <p className="text-gray-400 text-sm">Amazon wireless speakers.</p>
                        <a href="#" className="inline-block mt-2 text-white border-b">
                            Shop Now
                        </a>
                    </div>
                </div>

                {/* Perfume */}
                <div className="relative bg-[#161B22] p-6 rounded-lg flex flex-col justify-end min-h-[150px] overflow-hidden">
                    <img
                        src={i3_Gaming_Laptop}
                        alt="Perfume"
                        className="absolute py-3 inset-0 w-full h-full object-contain"
                    />
                    <div className="relative z-10">
                        <h2 className="text-lg font-bold text-white">Perfume</h2>
                        <p className="text-gray-400 text-sm">GUCCI INTENSE OUD EDP</p>
                        <a href="#" className="inline-block mt-2 text-white border-b">
                            Shop Now
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Store