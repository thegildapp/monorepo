import { useLazyLoadQuery } from 'react-relay';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../layout/Header';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import ListingGrid from '../features/ListingGrid';
import { CategoryType } from '../../types';
import { SearchListingsQuery } from '../../queries/listings';
import type { listingsSearchQuery as SearchListingsQueryType } from '../../__generated__/listingsSearchQuery.graphql';
import styles from './SearchPage.module.css';

const categoryMap: Record<string, CategoryType> = {
  'boats': CategoryType.Boats,
  'planes': CategoryType.Planes,
  'bikes': CategoryType.Bikes,
  'cars': CategoryType.Cars
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const urlQuery = searchParams.get('q') || '';
  
  // Local state for the search input
  const [searchInput, setSearchInput] = useState(urlQuery);
  
  // Update input when URL changes
  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);
  
  // Get category from URL path (e.g., /bikes/search) or search params (for /search?category=bikes)
  const categoryParam = category || searchParams.get('category');
  const categoryEnum = categoryParam ? categoryMap[categoryParam] : undefined;
  
  const data = useLazyLoadQuery<SearchListingsQueryType>(SearchListingsQuery, {
    query: urlQuery,
    category: categoryEnum,
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
              placeholder={`Search ${categoryParam ? categoryParam.toLowerCase() : 'all listings'}...`}
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
            category={categoryEnum}
          />
        </div>
      </Main>
    </Layout>
  );
}