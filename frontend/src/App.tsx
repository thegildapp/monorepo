import { Routes, Route } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import ItemPage from './components/pages/ItemPage';
import SearchPage from './components/pages/SearchPage';
import ScrollToTop from './components/utils/ScrollToTop';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/listing/:itemId" element={<ItemPage />} />
      </Routes>
    </>
  );
}

export default App;