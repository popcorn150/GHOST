import { useState } from "react"; // Add this import
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Category from "./pages/Category";
import AccountDetails from "./pages/AccountDetails";
import Settings from "./pages/Settings";
import UserProfile from "./pages/Profile/UserProfile";
import WelcomePage from "./pages/WelcomePage";
import AccountSetup from "./pages/AccountSetup";
import AccountLogin from "./pages/AccountLogin";
import Store from "./pages/Store/Store";
import ProductDetails from "./pages/Store/ProductDetails";
import MoreProducts from "./pages/Store/MoreProducts";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import FAQs from "./pages/FAQs";
import Doc from "./pages/Doc";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Community from "./pages/Community";
import Withdrawal from "./pages/Withdrawal";
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CartPageWrapper from './pages/CartPageWrapper'; 

// Add a ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Checking authentication...</div>;
  }

  return currentUser ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location.pathname }} replace />
  );
};

const App = () => {
  const [uploadedAccounts, setUploadedAccounts] = useState([]); // State to hold uploaded accounts

  return (
    <AuthProvider>
      <CartProvider>
    <Router>
      <Routes>
        <Route index element={<WelcomePage />} />
        <Route path="/sign-up" element={<AccountSetup />} />
        <Route path="/login" element={<AccountLogin />} />
        <Route
          path="/categories"
          element={<Category uploadedAccounts={uploadedAccounts} />}
        />
        <Route
          path="/account"
          element={<UserProfile setUploadedAccounts={setUploadedAccounts} />}
        />
        <Route path="/account/:slug" element={<AccountDetails />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/more-product/:slug" element={<MoreProducts />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/doc" element={<Doc />} />
        <Route
          path="/profile"
          element={<UserProfile setUploadedAccounts={setUploadedAccounts} />}
        />
        <Route path="/faqs" element={<FAQs />} />
        
        <Route path="/community" element={<Community />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/store" element={<Store />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/withdraw" element={<Withdrawal />} />
        <Route path="/cart" element={
              <ProtectedRoute>
                <CartPageWrapper />
              </ProtectedRoute>
            }/>
      </Routes>
    </Router>
    </CartProvider>
    </AuthProvider>
  );
};


export default App;
