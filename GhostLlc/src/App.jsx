import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Category from './pages/Category';
import AccountDetails from './pages/AccountDetails';
import CategoryFilter from './pages/CategoryFilter';
import UserProfile from './pages/Profile/UserProfile';


const App = () => {

  return (
    <>
      <Router>
        <Routes>
          <Route index element={<Category />} />
          <Route path='/account/:slug' element={<AccountDetails />} />
          <Route path='/categories' element={<CategoryFilter />} />
          <Route path='/profile' element={<UserProfile />} />
        </Routes>
      </Router>
    </>
  )
}

export default App