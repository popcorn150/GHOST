import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { auth } from "./database/firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";

// Import pages
import Category from "./pages/Category";
import AccountDetails from "./pages/AccountDetails";
import Settings from "./pages/Settings";
import UserProfile from "./pages/Profile/UserProfile";
import ProfileVisit from "./pages/Profile/ProfileVisit";
import WelcomePage from "./pages/WelcomePage";
import AccountSetup from "./pages/AccountSetup";
import AccountLogin from "./pages/AccountLogin";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import FAQs from "./pages/FAQs";
import Doc from "./pages/Doc";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

const App = () => {
  const [uploadedAccounts, setUploadedAccounts] = useState([]);

  return (

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
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/store" element={<Store />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </Router>
   
  );
};

export default App;
