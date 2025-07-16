import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './components/pages/HomePage';
import ItemPage from './components/pages/ItemPage';
import SearchPage from './components/pages/SearchPage';
import SignInPage from './components/pages/SignInPage';
import ProfilePage from './components/pages/ProfilePage';
import ScrollToTop from './components/utils/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/listing/:itemId" element={<ItemPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;