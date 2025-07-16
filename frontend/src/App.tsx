import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './components/pages/HomePage';
import ItemPage from './components/pages/ItemPage';
import SearchPage from './components/pages/SearchPage';
import SignInPage from './components/pages/SignInPage';
import ProfilePage from './components/pages/ProfilePage';
import EditProfilePage from './components/pages/EditProfilePage';
import CreateListingPage from './components/pages/CreateListingPage';
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
        <Route path="/me" element={<ProfilePage />} />
        <Route path="/me/profile" element={<EditProfilePage />} />
        <Route path="/me/new" element={<CreateListingPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;