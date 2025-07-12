import { useLazyLoadQuery } from 'react-relay';
import { useSearchParams } from 'react-router-dom';
import { useState, useCallback } from 'react';
import Header from '../layout/Header';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import ListingGrid from '../features/ListingGrid';
import SearchFilters from '../features/SearchFilters';
import type { SearchFilters as SearchFiltersType } from '../features/SearchFilters';
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
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category');
  const categoryEnum = categoryParam ? categoryMap[categoryParam] : undefined;
  
  const [filters, setFilters] = useState<SearchFiltersType>({});
  
  const handleFiltersChange = useCallback((newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  }, []);
  
  const data = useLazyLoadQuery<SearchListingsQueryType>(SearchListingsQuery, {
    query,
    category: categoryEnum,
    filters
  });

  const resultCount = data.searchListings.length;
  const hasResults = resultCount > 0;

  return (
    <Layout>
      <Header 
        logoText="Gild" 
        showSearch={true}
      />
      <Main>
        <div className={styles.searchPage}>
          <div className={styles.searchHeader}>
            <h1 className={styles.searchTitle}>
              Search Results
            </h1>
            <div className={styles.searchInfo}>
              {query && (
                <p className={styles.searchQuery}>
                  Showing results for "<strong>{query}</strong>"
                  {categoryParam && (
                    <span className={styles.categoryFilter}>
                      {' '}in {categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)}
                    </span>
                  )}
                </p>
              )}
              <p className={styles.resultCount}>
                {resultCount} {resultCount === 1 ? 'result' : 'results'} found
              </p>
            </div>
          </div>

          <SearchFilters 
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />

          {hasResults ? (
            <ListingGrid 
              listings={data.searchListings}
              category={categoryEnum}
            />
          ) : (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className={styles.noResultsTitle}>No results found</h2>
              <p className={styles.noResultsText}>
                {query ? (
                  <>
                    Sorry, we couldn't find any listings matching "<strong>{query}</strong>".
                    <br />
                    Try adjusting your search terms or browse our categories.
                  </>
                ) : (
                  "Please enter a search term to find listings."
                )}
              </p>
            </div>
          )}
        </div>
      </Main>
    </Layout>
  );
}