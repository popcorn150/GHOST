import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import pages
import Category from "./pages/Category";
import WelcomePage from "./pages/WelcomePage";
import AccountLogin from "./pages/AccountLogin";
import FAQs from "./pages/FAQs";
import Doc from "./pages/Doc";
import Community from "./pages/Community";
import Cart from "./pages/Cart";
import AchievementsGrid from "./pages/AchievementsGrid";
import StaticPage from "./pages/StaticPage";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route index element={<WelcomePage />} />
        <Route
          path="/sign-up"
          element={
            <StaticPage
              title="Sign Up"
              description="Account creation is disabled in this demo. Continue browsing without authentication."
            />
          }
        />
        <Route path="/login" element={<AccountLogin />} />
        <Route path="/categories" element={<Category />} />
        <Route
          path="/account"
          element={<StaticPage title="Account" description="No account data is available." />}
        />
        <Route
          path="/account/:slug"
          element={<StaticPage title="Account Details" description="Account detail pages are currently read-only." />}
        />
        <Route path="/profile" element={<StaticPage title="Profile" description="Profile pages do not require login." />} />
        <Route path="/profilevisit" element={<StaticPage title="Profile Visit" description="Guest browsing only." />} />
        <Route path="/profilevisit/:userId" element={<StaticPage title="Profile Visit" description="Guest browsing only." />} />
        <Route path="/doc" element={<Doc />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/community" element={<Community />} />
        <Route
          path="/privacy-policy"
          element={<StaticPage title="Privacy Policy" description="Privacy policy content is static and not tied to Firebase." />}
        />
        <Route
          path="/settings"
          element={<StaticPage title="Settings" description="Settings are not available without authentication." />}
        />
        <Route
          path="/forgot-password"
          element={<StaticPage title="Forgot Password" description="Password reset is disabled in this demo." />}
        />
        <Route
          path="/withdraw"
          element={<StaticPage title="Withdrawal" description="Withdrawal features are disabled in this demo." />}
        />
        <Route path="/cart" element={<Cart />} />
        <Route path="/achievements" element={<AchievementsGrid />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
