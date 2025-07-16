import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HeaderSearch.module.css';

interface HeaderSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export default function HeaderSearch({ 
  placeholder = "Search...", 
  onSearch,
  className = ''
}: HeaderSearchProps) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    if (!query.trim()) {
      setIsExpanded(false);
    }
  };

  const handleIconClick = () => {
    // Always navigate directly to search page
    navigate('/search');
  };

  return (
    <form className={`${styles.searchForm} ${className}`} onSubmit={handleSubmit}>
      <div className={`${styles.searchContainer} ${isExpanded ? styles.expanded : ''}`}>
        <svg 
          className={styles.searchIcon} 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none"
          onClick={handleIconClick}
        >
          <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2"/>
          <path d="m16 16 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={styles.searchInput}
        />
        {query && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => {
              setQuery('');
              setIsExpanded(false);
            }}
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