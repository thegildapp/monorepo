import { useNavigate } from 'react-router-dom';
import styles from './HeaderSearch.module.css';

interface HeaderSearchProps {
  className?: string;
}

export default function HeaderSearch({ className = '' }: HeaderSearchProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/search');
  };

  return (
    <button 
      className={`${styles.searchButton} ${className}`} 
      onClick={handleClick}
      aria-label="Search"
    >
      <svg 
        className={styles.searchIcon} 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none"
      >
        <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2"/>
        <path d="m16 16 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
  );
}