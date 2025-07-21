import { useLazyLoadQuery } from 'react-relay';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, Suspense } from 'react';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import ListingCard from '../features/ListingCard';
import LocationSelectorInline from '../features/LocationSelectorInline';
import LoadingGrid from '../features/LoadingGrid';
import { useScrollVisibility } from '../../contexts/ScrollVisibilityContext';
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

  if (data.searchListings.length === 0) {
    return (
      <div className={styles.noResults}>
        <div className={styles.noResultsIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <h3 className={styles.noResultsTitle}>No results found</h3>
        <p className={styles.noResultsText}>
          Try adjusting your search or changing your location
        </p>
      </div>
    );
  }

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
  const { isHeaderVisible, isMobile } = useScrollVisibility();
  
  // Local state for the search input
  const [searchInput, setSearchInput] = useState(urlQuery);
  const [location, setLocation] = useState<{lat: number; lng: number; city?: string; state?: string} | null>(null);
  const [radius, setRadius] = useState(20);
  
  // Update input when URL changes
  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

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
      <div className={styles.searchPageWrapper}>
      <div className={`${styles.searchHeader} ${!isHeaderVisible && isMobile ? styles.searchHeaderHidden : ''}`}>
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
            <LocationSelectorInline
              onLocationChange={(loc, rad) => {
                setLocation(loc);
                setRadius(rad);
              }}
            />
          </div>
        </form>
      </div>
      
      <Main>
        <div className={urlQuery ? styles.listingGridContainer : styles.emptyContainer}>
          {urlQuery ? (
            <Suspense fallback={<LoadingGrid />}>
              <SearchResults query={urlQuery} location={location} radius={radius} />
            </Suspense>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>Enter a search term to find listings</p>
            </div>
          )}
        </div>
      </Main>
      </div>
    </Layout>
  );
}