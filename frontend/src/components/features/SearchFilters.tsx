import { useState } from 'react';
import styles from './SearchFilters.module.css';

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export interface SearchFilters {
  priceMin?: number;
  priceMax?: number;
  location?: string;
  yearMin?: number;
  yearMax?: number;
  make?: string;
  model?: string;
}

export default function SearchFilters({ onFiltersChange, initialFilters = {} }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: string | number | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <div className={styles.searchFilters}>
      <button 
        className={styles.toggleButton}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Filters
        {hasActiveFilters && <span className={styles.filterIndicator}>•</span>}
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none"
          className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isExpanded && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Price Range</label>
            <div className={styles.rangeInputs}>
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin || ''}
                onChange={(e) => handleFilterChange('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
                className={styles.filterInput}
              />
              <span className={styles.rangeSeparator}>to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax || ''}
                onChange={(e) => handleFilterChange('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
                className={styles.filterInput}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Location</label>
            <input
              type="text"
              placeholder="City or State"
              value={filters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Year Range</label>
            <div className={styles.rangeInputs}>
              <input
                type="number"
                placeholder="Min"
                value={filters.yearMin || ''}
                onChange={(e) => handleFilterChange('yearMin', e.target.value ? parseInt(e.target.value) : undefined)}
                className={styles.filterInput}
              />
              <span className={styles.rangeSeparator}>to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.yearMax || ''}
                onChange={(e) => handleFilterChange('yearMax', e.target.value ? parseInt(e.target.value) : undefined)}
                className={styles.filterInput}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Make</label>
            <input
              type="text"
              placeholder="e.g. Toyota, Ford"
              value={filters.make || ''}
              onChange={(e) => handleFilterChange('make', e.target.value)}
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Model</label>
            <input
              type="text"
              placeholder="e.g. Camry, F-150"
              value={filters.model || ''}
              onChange={(e) => handleFilterChange('model', e.target.value)}
              className={styles.filterInput}
            />
          </div>

          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className={styles.clearButton}
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}