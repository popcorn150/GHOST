/* eslint-disable react/prop-types */
import "../App.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminIcon } from "../utils";
import { FaHeart, FaTrash, FaCartShopping } from "react-icons/fa6";

const CartPage = ({ cartItems, setCartItems }) => {
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Calculate subtotal whenever cartItems changes
    const total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
    setSubtotal(total);
  }, [cartItems]);

  const handleRemoveItem = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  return (
    <div className="p-2 md:p-8">
      {/* Cart Header */}
      <div className="flex items-center gap-3 mb-6">
        <FaCartShopping className="text-2xl text-blue-500" />
        <h1 className="text-2xl font-bold text-white">Your Cart</h1>
        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="category-loader w-24 h-24 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Cart Items Grid */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-[#18202D] text-white shadow-lg hover:shadow-xl flex flex-col md:flex-row gap-4"
                >
                  <img
                    src={item.img || AdminIcon}
                    alt={item.title}
                    className="w-full md:w-32 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm md:text-lg font-bold">
                          {item.title}
                        </h3>
                        <p className="text-gray-400 text-xs md:text-sm">
                          Category: {item.category || "General"}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                          className="bg-gray-700 text-white px-3 py-1 rounded"
                        >
                          -
                        </button>
                        <span className="px-2">{item.quantity || 1}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                          className="bg-gray-700 text-white px-3 py-1 rounded"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-lg font-bold">
                        ${(item.price || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-white text-xl mb-4">Your cart is empty</p>
                <Link
                  to="/"
                  className="inline-block bg-blue-500 text-white px-6 py-3 rounded-md text-sm md:text-base 
                            hover:bg-green-500 hover:scale-105 
                            transition-all duration-300 
                            active:opacity-75 active:scale-95
                            transform shadow-md hover:shadow-lg"
              >
                Browse Accounts
              </Link>
              </div>
            )}
          </div>

          {/* Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="bg-[#18202D] p-6 rounded-lg sticky bottom-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Subtotal</h3>
                <p className="text-xl font-bold">${subtotal.toFixed(2)}</p>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Shipping and taxes calculated at checkout
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Link
                  to="/store"
                  className="bg-gray-700 text-white px-6 py-3 rounded-md text-center flex-grow"
                >
                  Continue Shopping
                </Link>
                <button
                  className="bg-blue-500 text-white px-6 py-3 rounded-md flex-grow font-bold"
                  onClick={() => alert("Proceeding to checkout")}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CartPage;