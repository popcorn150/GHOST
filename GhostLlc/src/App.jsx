import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

const App = () => {
  return (
    <Router>
      <Routes>
        <Route index element={<WelcomePage />} />
        <Route path="/sign-up" element={<AccountSetup />} />
        <Route path="/login" element={<AccountLogin />} />
        <Route path="/categories" element={<Category />} />
        <Route path="/account" element={<UserProfile />} />
        <Route path="/account/:slug" element={<AccountDetails />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/more-product/:slug" element={<MoreProducts />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/store" element={<Store />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
};

export default App;
