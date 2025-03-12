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
    iPhone_,
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
                    <h3 className="text-red-500 text-base font-medium self-center">Today&apos;s Deal</h3>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl text-white font-bold">Flash Sales</h2>
                    <button className="px-6 py-2 bg-red-500 text-white rounded-lg cursor-pointer">
                        View All Products
                    </button>
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
            </div>

            {/* Category Section */}
            <div className="mt-5 flex gap-4 overflow-x-auto">
                {xennaStore.map((category) => (
                    <button
                        key={category.id}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${activeCategory === category.category
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-black"
                            }`}
                        onClick={() => setActiveCategory(category.category)}
                    >
                        {category.category}
                    </button>
                ))}
            </div>

            <div className="w-full flex justify-start my-2 px-15 gap-2">
                <TbRectangleVerticalFilled className="text-red-500 self-center w-7 h-7" />
                <h3 className="text-red-500 text-base font-medium self-center">This Month</h3>
            </div>

            <div className="w-full px-15 flex justify-between items-center mb-4">
                <h2 className="text-2xl text-white font-bold">
                    {`Best Selling ${filteredProducts.category}`}
                </h2>
                <button className="px-6 py-2 bg-red-500 text-white rounded-lg cursor-pointer">
                    View All
                </button>
            </div>

            <div className="grid lg:flex-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-3">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="p-4 rounded-lg shadow-md flex flex-col items-center"
                    >
                        <img
                            src={product.img}
                            alt={product.title}
                            className="w-full h-44 object-cover rounded"
                        />
                        <h3 className="font-medium text-white text-sm mt-2">
                            {product.title}
                        </h3>
                        <span className="text-xs text-gray-500 mt-1">
                            ⭐ {product.reviews} reviews
                        </span>
                    </div>
                ))}
            </div>

            <section className="bg-black text-white px-6 py-10 md:py-16 lg:py-20">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="text-center md:text-left">
                        <p className="text-green-500 text-sm font-semibold">Categories</p>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2">
                            Enhance Your Gaming Experience
                        </h2>
                        <button className="mt-6 px-6 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-600 cursor-pointer">
                            Buy Now!
                        </button>
                    </div>
                    {/* Right Side */}
                    <div className="flex justify-center">
                        <img
                            src={HavitGameNote}
                            alt="JBL Speaker"
                            className="max-w-full h-80 rounded-lg"
                        />
                    </div>
                </div>
            </section>

            <div className="w-full flex justify-start my-3 px-15 gap-2">
                <TbRectangleVerticalFilled className="text-red-500 self-center w-7 h-7" />
                <h3 className="text-red-500 text-base font-medium self-center">Featured</h3>
            </div>
            <h2 className="self-start text-2xl px-15 text-white font-bold">New Arrival</h2>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 p-15">
                <div className="relative bg-black text-white p-6 rounded-lg overflow-hidden">
                    <img src={Pes5} alt="Playstation5" className="absolute inset-0 w-full h-full object-cover opacity-80" />

                    <div className="relative z-10">
                        <h2 className="text-xl font-bold">Playstation 5</h2>
                        <p className="text-sm">
                            Black and White version of the Pes5 coming out on sale.
                        </p>
                        <a href="#" className="mt-2 inline-block text-white underline">
                            Shop Now
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative bg-black text-white p-6 rounded-lg overflow-hidden">
                        <img
                            src={iPad_Stand}
                            alt="Women's Collection"
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold">Women’s Collections</h2>
                            <p className="text-sm">Featured women collections that give you another vibe.</p>
                            <a href="#" className="mt-2 inline-block text-white underline">
                                Shop Now
                            </a>
                        </div>
                    </div>

                    <div className="relative bg-black text-white p-6 rounded-lg overflow-hidden">
                        <img
                            src={iPhone_}
                            alt="Speakers"
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold">Speakers</h2>
                            <p className="text-sm">Amazon wireless speakers</p>
                            <a href="#" className="mt-2 inline-block text-white underline">
                                Shop Now
                            </a>
                        </div>
                    </div>

                    <div className="relative bg-black text-white p-6 rounded-lg overflow-hidden">
                        <img
                            src={AnimeStickers}
                            alt="Perfume"
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold">Perfume</h2>
                            <p className="text-sm">GUCCI INTENSE OUD EDP</p>
                            <a href="#" className="mt-2 inline-block text-white underline">
                                Shop Now
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Store