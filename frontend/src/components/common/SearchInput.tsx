import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export default function SearchInput({ 
  placeholder = "Search listings...", 
  onSearch,
  className = ''
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <form className={`${styles.searchForm} ${className}`} onSubmit={handleSubmit}>
      <div className={styles.searchContainer}>
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
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={styles.searchInput}
        />
        {query && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}