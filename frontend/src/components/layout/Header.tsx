import { useNavigate } from 'react-router-dom';
import HeaderSearch from '../common/HeaderSearch';
import styles from './Header.module.css';

interface HeaderProps {
  logoText: string;
  categoryName?: string;
  onBackClick?: () => void;
  showSearch?: boolean;
}

export default function Header({ logoText, categoryName, onBackClick, showSearch = true }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleCategoryClick = () => {
    if (categoryName) {
      navigate(`/${categoryName.toLowerCase()}`);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.leftSection}>
          {onBackClick && (
            <button className={styles.backButton} onClick={onBackClick}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <h1 className={styles.logoTitle}>
            {categoryName ? (
              <>
                <span className={styles.logoText} onClick={handleLogoClick}>
                  {logoText}
                </span>
                <span className={styles.dot}>•</span>
                <span className={styles.categoryName} onClick={handleCategoryClick}>
                  {categoryName}
                </span>
              </>
            ) : (
              <span className={styles.logoText} onClick={handleLogoClick}>
                {logoText}
              </span>
            )}
          </h1>
        </div>
        
        {showSearch && (
          <HeaderSearch 
            placeholder="Search..." 
            className={styles.headerSearch}
          />
        )}
      </div>
      <div className={styles.headerBorder}></div>
    </header>
  );
}