import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFragment, graphql } from 'react-relay'
import type { SellerListingCard_listing$key } from '../../__generated__/SellerListingCard_listing.graphql'
import ImageWithFallback from '../common/ImageWithFallback'
import styles from './SellerListingCard.module.css'

const SellerListingCardFragment = graphql`
  fragment SellerListingCard_listing on Listing {
    id
    title
    price
    images
    city
    state
    createdAt
    status
  }
`;

interface SellerListingCardProps {
  listing: SellerListingCard_listing$key;
}

const SellerListingCard: React.FC<SellerListingCardProps> = ({ listing: listingRef }) => {
  const listing = useFragment(SellerListingCardFragment, listingRef);
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
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

  return (
    <div className={styles.sellerCard} onClick={handleCardClick}>
      <div className={styles.imageSection}>
        {listing.images && listing.images.length > 0 && !imageError ? (
          <ImageWithFallback
            src={listing.images[0]}
            alt={listing.title}
            className={styles.thumbnail}
            onError={() => setImageError(true)}
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
        <p className={styles.price}>{formatPrice(listing.price)}</p>
        
        <div className={styles.meta}>
          {listing.city && (
            <div className={styles.location}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>{listing.city}{listing.state ? `, ${listing.state}` : ''}</span>
            </div>
          )}
          
          <div className={styles.stats}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>{daysActive} {daysActive === 1 ? 'day' : 'days'} active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerListingCard;