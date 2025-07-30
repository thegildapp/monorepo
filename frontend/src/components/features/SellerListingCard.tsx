import { useNavigate } from 'react-router-dom'
import { useFragment, graphql } from 'react-relay'
import type { SellerListingCard_listing$key } from '../../__generated__/SellerListingCard_listing.graphql'
import ImageWithFallback from '../common/ImageWithFallback'
import styles from './SellerListingCard.module.css'

const SellerListingCardFragment = graphql`
  fragment SellerListingCard_listing on Listing {
    id
    title
    images
    createdAt
    pendingInquiriesCount
    inquiries {
      id
    }
  }
`;

interface SellerListingCardProps {
  listing: SellerListingCard_listing$key;
}

const SellerListingCard: React.FC<SellerListingCardProps> = ({ listing: listingRef }) => {
  const listing = useFragment(SellerListingCardFragment, listingRef);
  const navigate = useNavigate();
  
  // Mock views data - in a real app this would come from the backend
  const getViewsCount = () => {
    // Generate consistent mock data based on listing ID
    const hash = listing.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 20 + (hash % 180); // Returns a number between 20-200
  };

  const getDaysActive = (dateString: string) => {
    try {
      // The backend returns ISO date strings
      const date = new Date(dateString);
      const now = new Date();
      
      if (isNaN(date.getTime())) {
        return 0;
      }
      
      // Calculate difference in calendar days, not 24-hour periods
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfListingDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      const days = Math.floor((startOfToday.getTime() - startOfListingDay.getTime()) / 86400000);
      return Math.max(0, days);
    } catch (error) {
      return 0;
    }
  };

  const handleCardClick = () => {
    navigate(`/listing/${listing.id}/manage`);
  };

  const daysActive = getDaysActive(listing.createdAt);

  // Get thumbnail URL
  const getThumbnailUrl = () => {
    return listing.images?.[0];
  };

  return (
    <div className={styles.sellerCard} onClick={handleCardClick}>
      <div className={styles.imageSection}>
        {listing.images && listing.images.length > 0 ? (
          <ImageWithFallback
            src={getThumbnailUrl()}
            alt={listing.title}
            className={styles.thumbnail}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
      </div>
      
      <div className={styles.contentSection}>
        <h3 className={styles.title}>{listing.title}</h3>
        
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span className={styles.statText}>
              <span className={styles.statValue}>{getViewsCount()}</span> views
            </span>
          </div>
          
          <div className={styles.statItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            <span className={styles.statText}>
              <span className={styles.statValue}>{listing.inquiries?.length || 0}</span> contacts
            </span>
          </div>
          
          <div className={styles.statItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className={styles.statText}>
              <span className={styles.statValue}>{daysActive}</span> {daysActive === 1 ? 'day' : 'days'} active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerListingCard;