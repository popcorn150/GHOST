import { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { TbRectangleVerticalFilled } from "react-icons/tb";
import {
    AnimeStickers,
    DAGEL_Finger_Sleeves,
    DLA_8,
    GamingGloves,
    HavitGameNote,
    iPad_,
    iPad_Stand,
    NonGamerPackage,
    Pes5,
    Xenna
} from "../../utils"
import xennaStore from "../../constants/store";

const carouselImages = [
    Pes5,
    iPad_,
    AnimeStickers,
    NonGamerPackage,
    DAGEL_Finger_Sleeves
];

const flashSalesProducts = [
    {
        id: 1,
        name: "DAGEL Finger Sleeves",
        image: DAGEL_Finger_Sleeves,
        views: "255K",
        rating: 88,
    },
    {
        id: 2,
        name: "DLA 8",
        image: DLA_8,
        views: "365K",
        rating: 75,
    },
    {
        id: 3,
        name: "Gaming Gloves",
        image: GamingGloves,
        views: "55K",
        rating: 99,
    },
    {
        id: 4,
        name: "Havit Gamenote Fuxi-H3 Quad-Mode Gaming headphone",
        image: HavitGameNote,
        views: "80K",
        rating: 50,
    },
    {
        id: 5,
        name: "iPad Stand",
        image: iPad_Stand,
        views: "20K",
        rating: 10,
    },
    {
        id: 6,
        name: "iPad",
        image: iPad_,
        views: "120K",
        rating: 70,
    },
];

const Store = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeCategory, setActiveCategory] = useState(xennaStore[0].category);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const filteredProducts = xennaStore.find(
        (category) => category.category === activeCategory
    )?.types || [];

    return (
        <div className="min-h-screen flex flex-col items-center">
            <div className="w-full flex justify-between items-center px-12 py-4 bg-[#0D1117]">
                <img src={Xenna} alt="XennaLogo" className="h-10 rounded-md" />
                <div className="relative w-80">
                    <input
                        type="text"
                        placeholder="What are you looking for?"
                        className="w-full p-2 pl-4 pr-10 bg-gray-800 text-white rounded-lg outline-none"
                    />
                    <IoSearchOutline className="absolute right-3 top-3 text-gray-400" />
                </div>
            </div>

            <div className="relative w-full max-w-7xl overflow-hidden rounded-md mt-6">
                <div className="flex transition-transform duration-1000"
                    style={{
                        transform: `translateX(-${currentIndex * 100}%)`,
                        width: `${carouselImages.length * 100}%`
                    }}
                >
                    {
                        carouselImages.map((src, index) => (
                            <div key={index} className="w-full flex-shrink-0">
                                <img
                                    src={src}
                                    alt={`Slide ${index + 1}`}
                                    className="w-full h-60 object-cover"
                                />
                            </div>
                        ))
                    }
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {carouselImages.map((_, index) => (
                        <div
                            key={index}
                            className={`h-3 w-3 rounded-full ${index === currentIndex ? 'bg-red-500' : 'bg-gray-400'
                                }`}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Flash Sales Section */}
            <div className="w-full max-w-7xl mt-10 px-5">
                <div className="flex justify-start my-2 gap-2">
                    <TbRectangleVerticalFilled className="text-red-500 self-center w-7 h-7" />
                    <h3 className="text-red-500 text-lg font-medium self-center">Today&apos;s Deal</h3>
                </div>
                <div className="mb-4">
                    <h2 className="text-2xl text-white font-bold">Flash Sales</h2>
                </div>

                <div className="flex overflow-x-auto space-x-4 scrollbar-hide">
                    {flashSalesProducts.map((product) => (
                        <div
                            key={product.id}
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
                    ))}
                </div>
                <div className="flex justify-center items-center my-5">
                    <button className="px-6 py-2 bg-red-500 text-white rounded-lg">
                        View All Products
                    </button>
                </div>

            </div>

            {/* Category Section */}
            <div className="flex gap-4 overflow-x-auto">
                {xennaStore.map((category) => (
                    <button
                        key={category.id}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeCategory === category.category
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-black"
                            }`}
                        onClick={() => setActiveCategory(category.category)}
                    >
                        {category.category}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center"
                    >
                        <img
                            src={product.img}
                            alt={product.title}
                            className="w-full h-40 object-cover rounded-md"
                        />
                        <h3 className="font-bold text-lg mt-2">
                            {product.title}
                        </h3>
                        <span className="text-blue-500 font-semibold mt-1">
                            {product.reviews} Reviews
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Store