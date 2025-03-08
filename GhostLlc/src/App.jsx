import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Category from "./pages/Category";
import AccountDetails from "./pages/AccountDetails";
import Settings from "./pages/Settings";
import UserProfile from "./pages/Profile/UserProfile";
import WelcomePage from "./pages/WelcomePage";
import AccountSetup from "./pages/AccountSetup";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route index element={<WelcomePage />} />
          <Route path="/setup" element={<AccountSetup />} />
          <Route path="/categories" element={<Category />} />
          <Route path="/account/:slug" element={<AccountDetails />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/account" element={<UserProfile />} />
          <Route path="/categories" element={<UserProfile />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
