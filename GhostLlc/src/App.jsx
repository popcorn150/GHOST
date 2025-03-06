<<<<<<< HEAD
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Category from "./pages/Category";
import AccountDetails from "./pages/AccountDetails";
import CategoryFilter from "./pages/CategoryFilter";
import Settings from "./pages/Settings"; // Import the Settings page
=======
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Category from './pages/Category';
import AccountDetails from './pages/AccountDetails';
import CategoryFilter from './pages/CategoryFilter';
import UserProfile from './pages/Profile/UserProfile';

>>>>>>> 0f6cb1a354f2e614d6a45e65db963d1ceaffd331

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route index element={<Category />} />
<<<<<<< HEAD
          <Route path="/account/:slug" element={<AccountDetails />} />
          <Route path="/categories" element={<CategoryFilter />} />
          <Route path="/settings" element={<Settings />} />{" "}
          
=======
          <Route path='/account/:slug' element={<AccountDetails />} />
          <Route path='/categories' element={<CategoryFilter />} />
          <Route path='/profile' element={<UserProfile />} />
>>>>>>> 0f6cb1a354f2e614d6a45e65db963d1ceaffd331
        </Routes>
      </Router>
    </>
  );
};

export default App;
