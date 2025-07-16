import { useNavigate } from 'react-router-dom';
import HeaderSearch from '../common/HeaderSearch';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Header.module.css';

interface HeaderProps {
  logoText: string;
  categoryName?: string;
  onBackClick?: () => void;
  showSearch?: boolean;
}

export default function Header({ logoText, categoryName, onBackClick, showSearch = true }: HeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleCategoryClick = () => {
    if (categoryName) {
      navigate(`/${categoryName.toLowerCase()}`);
    }
  };

  const handleProfileClick = () => {
    navigate(user ? '/profile' : '/signin');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.leftSection}>
          <button className={styles.profileButton} onClick={handleProfileClick}>
            {user ? (
              user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="6.5" r="5" fill="white"/>
                <path d="M0 26c0-6.63 5.37-12 12-12s12 5.37 12 12" fill="white"/>
              </svg>
            )}
          </button>
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