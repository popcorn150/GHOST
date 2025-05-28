import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { Link } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import { BsCart4 } from "react-icons/bs";
import { Toaster, toast } from "sonner";
import { AdminIcon } from "../utils"; // Adjusted to match your import pattern

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("ghost_cart");
    const parsed = stored ? JSON.parse(stored) : [];

    console.log("📦 Fetched from localStorage (Cart page):", parsed);

    setCartItems(parsed);
  }, []);

  const removeFromCart = (id) => {
    const updated = cartItems.filter((item) => (item.slug || item.id) !== id);
    setCartItems(updated);
    localStorage.setItem("ghost_cart", JSON.stringify(updated));
    toast.success("Removed from cart!");
  };

  const proceedToCheckout = () => {
    // Here you would typically handle the checkout process
    // For now, we'll just show a toast and mark items as purchased
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          // Add all items to purchased storage
          const purchasedAccounts =
            JSON.parse(localStorage.getItem("ghost_purchased")) || [];
          const updatedPurchased = [...purchasedAccounts, ...cartItems];
          localStorage.setItem(
            "ghost_purchased",
            JSON.stringify(updatedPurchased)
          );

          // Clear cart
          localStorage.setItem("ghost_cart", JSON.stringify([]));
          setCartItems([]);

          resolve();
        }, 2000);
      }),
      {
        loading: "Processing your purchase...",
        success: "All accounts purchased successfully!",
        error: "Failed to complete purchase",
      }
    );
  };

  return (
    <>
      <NavBar />
      <div className="p-6 text-white min-h-screen bg-[#010409]">
        <Toaster richColors position="top-center" />

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
              to="/categories"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md text-white font-medium"
            >
              Browse Accounts
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {cartItems.map((item, index) => (
                <div
                  key={item.slug || item.id || index}
                  className="bg-[#111827] rounded-lg overflow-hidden shadow-md relative"
                >
                  <img
                    src={item.img || AdminIcon}
                    alt={item.title}
                    className="w-full h-40 p-2 rounded-lg object-cover"
                    onError={(e) => {
                      console.error(`Failed to load image for ${item.title}`);
                      e.target.src = AdminIcon; // Fallback image
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg text-white font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {item.views} Total Views
                    </p>
                    {item.accountWorth && (
                      <p className="text-blue-400 font-medium mt-2">
                        ${item.accountWorth.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.slug || item.id)}
                    className="absolute top-3 right-3 p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
                    aria-label="Remove from cart"
                  >
                    <FaTrashAlt className="h-4 w-4 self-center text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center border-t border-gray-700 pt-4 pb-2">
              <p className="text-gray-300">
                <span className="font-medium">Total items:</span>{" "}
                {cartItems.length}
              </p>
              <button
                onClick={proceedToCheckout}
                className="bg-[#0576FF] hover:bg-[#0465db] px-6 py-2 rounded-md text-white font-medium transition-colors"
              >
                Complete Purchase
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;
