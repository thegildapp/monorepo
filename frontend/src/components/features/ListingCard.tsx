import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFragment, graphql } from 'react-relay'
import type { ListingCard_listing$key } from '../../__generated__/ListingCard_listing.graphql'
import ImageWithFallback from '../common/ImageWithFallback';
import LocationPin from '../common/LocationPin';
import styles from './ListingCard.module.css'

const ListingCardFragment = graphql`
  fragment ListingCard_listing on Listing {
    id
    title
    price
    images
    city
    state
    createdAt
  }
`;

interface ListingCardProps {
  listing: ListingCard_listing$key;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing: listingRef }) => {
  const listing = useFragment(ListingCardFragment, listingRef);
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  
  const getImageUrl = (index: number) => {
    return listing.images[index];
  };
  
  const images = listing.images?.length > 0 ? listing.images : []
  
  const getCurrentIndex = () => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer || images.length === 0) return 0
    
    const itemWidth = scrollContainer.offsetWidth
    if (itemWidth === 0) return 0
    
    return Math.min(
      Math.round(scrollPosition / itemWidth),
      images.length - 1
    )
  }
  
  const currentImageIndex = getCurrentIndex()
  
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const handleScroll = () => {
      setScrollPosition(scrollContainer.scrollLeft)
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [])
  
  const scrollToIndex = (index: number) => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return
    
    const itemWidth = scrollContainer.offsetWidth
    scrollContainer.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth'
    })
  }
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const timeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date()
      
      if (isNaN(date.getTime())) {
        return 'Recently listed'
      }
      
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfListingDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      const days = Math.floor((startOfToday.getTime() - startOfListingDay.getTime()) / 86400000)
      
      if (days < 0) return 'Recently listed'
      if (days === 0) return 'Listed today'
      if (days === 1) return 'Listed yesterday'
      if (days < 7) return `Listed ${days} days ago`
      if (days < 30) return `Listed ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
      if (days < 365) return `Listed ${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`
      return 'Listed over a year ago'
    } catch (error) {
      return 'Recently listed'
    }
  }


  const handleCardClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.desktopNavButton')) {
      return
    }
    navigate(`/listing/${listing.id}`)
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentImageIndex > 0) {
      scrollToIndex(currentImageIndex - 1)
    }
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentImageIndex < images.length - 1) {
      scrollToIndex(currentImageIndex + 1)
    }
  }

  return (
    <div className={styles.listingCard}>
      <div 
        className={styles.listingImageContainer}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {images[0] ? (
          <>
            <div 
              ref={scrollContainerRef}
              className={styles.carouselScrollContainer}
            >
              {images.map((_: string, index: number) => (
                <div key={index} className={styles.carouselSlide}>
                  <ImageWithFallback
                    src={getImageUrl(index)} 
                    alt={`${listing.title} - Image ${index + 1}`}
                    className={styles.listingImage}
                  />
                </div>
              ))}
            </div>
            {images.length > 1 && (
              <>
                <div className={styles.carouselIndicators}>
                  {images.map((_: string, index: number) => (
                    <div
                      key={index}
                      className={`${styles.carouselDot} ${index === currentImageIndex ? styles.active : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        scrollToIndex(index)
                      }}
                    />
                  ))}
                </div>
                
                {isHovered && (
                  <>
                    <button 
                      className={`${styles.desktopNavButton} ${styles.prev} ${currentImageIndex === 0 ? styles.disabled : ''}`}
                      onClick={handlePrevImage}
                      disabled={currentImageIndex === 0}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      className={`${styles.desktopNavButton} ${styles.next} ${currentImageIndex === images.length - 1 ? styles.disabled : ''}`}
                      onClick={handleNextImage}
                      disabled={currentImageIndex === images.length - 1}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <div className={styles.listingImagePlaceholder}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
      </div>
      
      <div className={styles.listingContent} onClick={handleCardClick}>
        <h3 className={styles.listingTitle}>{listing.title}</h3>
        <p className={styles.listingPrice}>{formatPrice(listing.price)}</p>
        
        <div className={styles.listingMeta}>
          <div className={styles.listingLocationContainer}>
            <LocationPin className={styles.locationIcon} />
            {listing.city && (
              <span className={styles.listingLocation}>
                {listing.city}
              </span>
            )}
          </div>
          <span className={styles.listingTime}>{timeAgo(listing.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}

export default ListingCard