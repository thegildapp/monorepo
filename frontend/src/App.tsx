import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ScrollVisibilityProvider } from './contexts/ScrollVisibilityContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import PageErrorBoundary from './components/common/PageErrorBoundary';
import HomePage from './components/pages/HomePage';
import ItemPage from './components/pages/ItemPage';
import SearchPage from './components/pages/SearchPage';
import SignInPage from './components/pages/SignInPage';
import SignUpPage from './components/pages/SignUpPage';
import ProfilePage from './components/pages/ProfilePage';
import EditProfilePage from './components/pages/EditProfilePage';
import ListingManagementPage from './components/pages/ListingManagementPage';
import EditListingPage from './components/pages/EditListingPage';
import VerifyEmailPage from './components/pages/VerifyEmailPage';
import ScrollToTop from './components/utils/ScrollToTop';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ScrollVisibilityProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} errorElement={<PageErrorBoundary />} />
            <Route path="/search" element={<SearchPage />} errorElement={<PageErrorBoundary />} />
            <Route path="/listing/:itemId" element={<ItemPage />} errorElement={<PageErrorBoundary />} />
            <Route path="/listing/:itemId/manage" element={<ListingManagementPage />} errorElement={<PageErrorBoundary />} />
            <Route path="/listing/:itemId/edit" element={<EditListingPage />} errorElement={<PageErrorBoundary />} />
            <Route path="/signin" element={<SignInPage />} errorElement={<PageErrorBoundary />} />
            <Route path="/signup" element={<SignUpPage />} errorElement={<PageErrorBoundary />} />
            <Route path="/me" element={<ProfilePage />} errorElement={<PageErrorBoundary />} />
            <Route path="/me/profile" element={<EditProfilePage />} errorElement={<PageErrorBoundary />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} errorElement={<PageErrorBoundary />} />
          </Routes>
        </ScrollVisibilityProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;