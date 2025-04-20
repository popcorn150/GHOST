// src/pages/CartPageWrapper.js
import { useCart } from '../context/CartContext';  // Changed to '../context'
import CartPage from '../components/CartPage';

const CartPageWrapper = () => {
  const { cartItems, setCartItems } = useCart();
  
  return <CartPage cartItems={cartItems} setCartItems={setCartItems}/>;
};

export default CartPageWrapper;