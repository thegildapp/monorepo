import { useLazyLoadQuery } from 'react-relay';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, Suspense } from 'react';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import ListingCard from '../features/ListingCard';
import LocationSelector from '../features/LocationSelector';
import LoadingGrid from '../features/LoadingGrid';
import { SearchListingsQuery } from '../../queries/listings';
import type { listingsSearchQuery as SearchListingsQueryType } from '../../__generated__/listingsSearchQuery.graphql';
import styles from './SearchPage.module.css';

interface SearchResultsProps {
  query: string;
  location: {lat: number; lng: number; city?: string; state?: string} | null;
  radius: number;
}

function SearchResults({ query, location, radius }: SearchResultsProps) {
  const data = useLazyLoadQuery<SearchListingsQueryType>(SearchListingsQuery, {
    query: query,
    filters: location ? {
      latitude: location.lat,
      longitude: location.lng,
      radius: radius
    } : {}
  });

  return (
    <div className={styles.listingsGrid}>
      {data.searchListings.map((listing, index) => (
        <ListingCard key={listing.id || `listing-${index}`} listing={listing} />
      ))}
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlQuery = searchParams.get('q') || '';
  
  // Local state for the search input
  const [searchInput, setSearchInput] = useState(urlQuery);
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [location, setLocation] = useState<{lat: number; lng: number; city?: string; state?: string} | null>(null);
  const [radius, setRadius] = useState(20);
  const lastScrollY = useRef(0);
  
  // Update input when URL changes
  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);
  
  // Handle scroll to hide/show search header on mobile
  useEffect(() => {
    const handleScroll = () => {
      // Only apply on mobile
      if (window.innerWidth > 768) return;
      
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down & past threshold
        setIsSearchVisible(false);
      } else {
        // Scrolling up
        setIsSearchVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('q', searchInput.trim());
      setSearchParams(newParams);
      
      // Blur the input to close the keyboard on mobile
      const searchInputElement = e.currentTarget.querySelector('input[type="text"]');
      if (searchInputElement instanceof HTMLInputElement) {
        searchInputElement.blur();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  return (
    <Layout>
      <div className={`${styles.searchHeader} ${!isSearchVisible ? styles.searchHeaderHidden : ''}`}>
        <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
          <div className={styles.searchRow}>
            <div className={styles.searchInputContainer}>
              <button
                type="button"
                onClick={() => navigate('/')}
                className={styles.backButton}
                aria-label="Back to browse"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <input
                type="text"
                value={searchInput}
                onChange={handleInputChange}
                placeholder="Search listings..."
                className={styles.searchInput}
                autoFocus
              />
            </div>
          </div>
          <div className={styles.locationSelectorWrapper}>
            <LocationSelector
              onLocationChange={(loc, rad) => {
                setLocation(loc);
                setRadius(rad);
              }}
            />
          </div>
        </form>
      </div>
      
      <Main>
        <div className={styles.listingGridContainer}>
          <Suspense fallback={<LoadingGrid />}>
            <SearchResults query={urlQuery} location={location} radius={radius} />
          </Suspense>
        </div>
      </Main>
    </Layout>
  );
}