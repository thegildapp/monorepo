import { useNavigate, useLocation } from 'react-router-dom';
import HeaderSearch from '../common/HeaderSearch';
import { useAuth } from '../../contexts/AuthContext';
import { useScrollVisibility } from '../../contexts/ScrollVisibilityContext';
import styles from './Header.module.css';

interface HeaderProps {
  logoText: string;
  categoryName?: string;
  onBackClick?: () => void;
  showSearch?: boolean;
  extraContent?: React.ReactNode;
  onListClick?: () => void;
}

export default function Header({ logoText, categoryName, onBackClick, showSearch = true, extraContent, onListClick }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isHeaderVisible, isMobile } = useScrollVisibility();
  
  const isOnProfilePage = location.pathname === '/me';

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleCategoryClick = () => {
    if (categoryName) {
      navigate(`/${categoryName.toLowerCase()}`);
    }
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/me');
    } else {
      navigate('/signin');
    }
  };

  return (
    <header className={`${styles.header} ${!isHeaderVisible && isMobile ? styles.headerHidden : ''}`}>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
        
        <div className={styles.rightSection}>
          {user && isOnProfilePage && (
            <>
              <button 
                onClick={onListClick || (() => navigate('/me/new'))} 
                className={styles.listButton}
                title="Create new listing"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                List
              </button>
              <button
                onClick={() => navigate('/me/profile')}
                className={styles.headerActionLink}
              >
                Profile
              </button>
              <button
                onClick={() => navigate('/')}
                className={styles.headerActionLink}
              >
                Browse
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className={styles.headerActionLink}
              >
                Sign Out
              </button>
            </>
          )}
          
          {extraContent && (
            <div className={styles.extraContent}>
              {extraContent}
            </div>
          )}
          
          {showSearch && (
            <HeaderSearch className={styles.headerSearch} />
          )}
        </div>
      </div>
    </header>
  );
}