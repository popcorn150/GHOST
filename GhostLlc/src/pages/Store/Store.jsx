import { Link } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { TbRectangleVerticalFilled } from "react-icons/tb";
import { Xenna } from "../../utils"
import flashSalesProducts from "./flashSalesProducts";


const Store = () => {

    // const filteredProducts = xennaStore.find(
    //     (category) => category.category === activeCategory
    // )?.types || [];

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
                    <h3 className="text-red-500 text-base font-medium self-center">Today&apos;s Deal</h3>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl text-white font-bold">Flash Sales</h2>
                    <button className="px-6 py-2 bg-red-500 text-white rounded-lg cursor-pointer">
                        View All Products
                    </button>
                </div>

                <div className="flex overflow-x-auto space-x-4 scrollbar-hide">
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
        </div>
    )
}

export default Store