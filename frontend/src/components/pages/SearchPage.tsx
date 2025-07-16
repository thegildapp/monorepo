import { useLazyLoadQuery } from 'react-relay';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import ListingGrid from '../features/ListingGrid';
import { SearchListingsQuery } from '../../queries/listings';
import type { listingsSearchQuery as SearchListingsQueryType } from '../../__generated__/listingsSearchQuery.graphql';
import styles from './SearchPage.module.css';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  
  // Local state for the search input
  const [searchInput, setSearchInput] = useState(urlQuery);
  
  // Update input when URL changes
  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);
  
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
      <div className={styles.searchHeader}>
        <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
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
        <div className={styles.searchPageContainer}>
          <ListingGrid 
            listings={data.searchListings}
          />
        </div>
      </Main>
    </Layout>
  );
}