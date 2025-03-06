import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Category from "./pages/Category";
import AccountDetails from "./pages/AccountDetails";
import CategoryFilter from "./pages/CategoryFilter";
import Settings from "./pages/Settings"; // Import the Settings page

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route index element={<Category />} />
          <Route path="/account/:slug" element={<AccountDetails />} />
          <Route path="/categories" element={<CategoryFilter />} />
          <Route path="/settings" element={<Settings />} />{" "}
          
        </Routes>
      </Router>
    </>
  );
};

export default App;
