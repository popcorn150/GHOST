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
import Community from "./pages/Community";
import Withdrawal from "./pages/Withdrawal";
import Cart from "./pages/Cart";
import AchievementsGrid from "./pages/AchievementsGrid";

// Session timeout wrapper component
const SessionTimeoutWrapper = ({ children }) => {
  const navigate = useNavigate();
  const TIMEOUT_DURATION = 60 * 60 * 1000;

  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(handleLogout, TIMEOUT_DURATION);
    };

    const handleLogout = () => {
      signOut(auth)
        .then(() => {
          console.log("User logged out due to inactivity");
          navigate("/login");
        })
        .catch((error) => {
          console.error("Logout error:", error);
        });
    };

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        resetTimer();
        const events = [
          "mousedown",
          "keypress",
          "scroll",
          "touchstart",
          "mousemove",
        ];
        events.forEach((event) => window.addEventListener(event, resetTimer));
      }
    });

    return () => {
      clearTimeout(inactivityTimer);
      if (authUnsubscribe) authUnsubscribe();

      const events = [
        "mousedown",
        "keypress",
        "scroll",
        "touchstart",
        "mousemove",
      ];
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [navigate]);

  return children;
};

const App = () => {
  const [uploadedAccounts, setUploadedAccounts] = useState([]);

  return (
    <Router>
      <AuthProvider>
        <SessionTimeoutWrapper>
          <Routes>
            {/* Public Routes */}
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
            <Route path="/cart" element={<Cart />} />
            <Route path="/account/:slug" element={<AccountDetails />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/profilevisit" element={<ProfileVisit />} />
            <Route path="/doc" element={<Doc />} />
            <Route
              path="/profile"
              element={<UserProfile setUploadedAccounts={setUploadedAccounts} />}
            />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/community" element={<Community />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/doc" element={<Doc />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/withdraw" element={<Withdrawal />} />
            <Route path="/achievements" element={<AchievementsGrid />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/categories"
                element={<Category uploadedAccounts={uploadedAccounts} />}
              />
              <Route
                path="/account"
                element={
                  <UserProfile setUploadedAccounts={setUploadedAccounts} />
                }
              />
              <Route
                path="/profile"
                element={
                  <UserProfile setUploadedAccounts={setUploadedAccounts} />
                }
              />
              <Route path="/account/:slug" element={<AccountDetails />} />
              
              
              <Route path="/community" element={<Community />} />
              
              <Route path="/settings" element={<Settings />} />
              <Route
                path="/profilevisit/:userId"
                element={<ProfileVisit />}
              />{" "}
              {/* Protected and parameterized */}
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SessionTimeoutWrapper>
      </AuthProvider>
    </Router>
  );
};

export default App;
