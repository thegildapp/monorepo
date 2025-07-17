import { useLazyLoadQuery } from 'react-relay';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import ListingCard from '../features/ListingCard';
import { SearchListingsQuery } from '../../queries/listings';
import type { listingsSearchQuery as SearchListingsQueryType } from '../../__generated__/listingsSearchQuery.graphql';
import styles from './SearchPage.module.css';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlQuery = searchParams.get('q') || '';
  
  // Local state for the search input
  const [searchInput, setSearchInput] = useState(urlQuery);
  const [isSearchVisible, setIsSearchVisible] = useState(true);
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
  
  const data = useLazyLoadQuery<SearchListingsQueryType>(SearchListingsQuery, {
    query: urlQuery,
    filters: {}
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('q', searchInput.trim());
      setSearchParams(newParams);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  return (
    <Layout>
      <div className={`${styles.searchHeader} ${!isSearchVisible ? styles.searchHeaderHidden : ''}`}>
        <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
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
          <div className={styles.searchInputContainer}>
            <svg 
              className={styles.searchIcon} 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={handleInputChange}
              placeholder="Search listings..."
              className={styles.searchInput}
              autoFocus
            />
          </div>
        </form>
      </div>
      
      <Main>
        <div className={styles.listingGridContainer}>
          <div className={styles.listingsGrid}>
            {data.searchListings.map((listing, index) => (
              <ListingCard key={listing.id || `listing-${index}`} listing={listing} />
            ))}
          </div>
        </div>
      </Main>
    </Layout>
  );
}