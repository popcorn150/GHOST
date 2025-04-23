import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { Link } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import { BsCart4 } from "react-icons/bs";
import { toast } from "sonner";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem("ghost_cart");
        const parsed = stored ? JSON.parse(stored) : [];

        console.log("📦 Fetched from localStorage (Cart page):", parsed);


        setCartItems(parsed);
    }, []);

    const removeFromCart = (id) => {
        const updated = cartItems.filter(
            (item) => (item.slug || item.id) !== id
        );
        setCartItems(updated);
        localStorage.setItem("ghost_cart", JSON.stringify(updated));
        toast.success("Removed from cart!");
    };

    return (
        <>
            <NavBar />
            <div className="p-6 text-white min-h-screen">
                <h2 className="flex gap-2 text-2xl text-white font-bold mb-6">
                    Your Cart
                    <BsCart4 className="w-7 h-7 self-center" />
                </h2>

                {cartItems.length === 0 ? (
                    <div className="text-center mt-20">
                        <div className="w-full max-w-sm mx-auto bg-[#1F2937] p-6 rounded-lg animate-pulse">
                            <div className="h-40 bg-gray-700 rounded-md mb-4"></div>
                            <div className="h-4 bg-gray-600 rounded w-2/3 mb-2"></div>
                            <div className="h-4 bg-gray-600 rounded w-1/3"></div>
                        </div>
                        <p className="text-gray-400 mt-6">Your cart is currently empty.</p>
                        <Link
                            to='/categories'
                            className='inline-block mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md text-white font-medium'
                        >
                            Browse Accounts
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cartItems.map((item, index) => (
                            <div
                                key={item.slug || item.id || index}
                                className="bg-[#111827] rounded-lg overflow-hidden shadow-md relative"
                            >
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    className="w-full h-40 p-2 rounded-lg object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="text-lg text-white font-semibold">{item.title}</h3>
                                    <p className="text-gray-400 text-sm">{item.views} Total Views</p>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.slug || item.id)}
                                    className="absolute top-3 right-3 p-2 bg-gray-800 text-white rounded-full"
                                >
                                    <FaTrashAlt className="h-4 w-4 self-center text-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}

export default Cart