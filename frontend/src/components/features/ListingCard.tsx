import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFragment, graphql } from 'react-relay'
import type { ListingCard_listing$key } from '../../__generated__/ListingCard_listing.graphql'
import ImageWithFallback from '../common/ImageWithFallback';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isScrolling = useRef(false)
  
  const images = listing.images?.length > 0 ? listing.images : []
  
  // Handle scroll snapping
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const handleScroll = () => {
      if (!isScrolling.current) return
      
      const scrollLeft = scrollContainer.scrollLeft
      const itemWidth = scrollContainer.offsetWidth
      const newIndex = Math.round(scrollLeft / itemWidth)
      
      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex)
      }
    }

    const handleScrollEnd = () => {
      isScrolling.current = false
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    scrollContainer.addEventListener('scrollend', handleScrollEnd)

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      scrollContainer.removeEventListener('scrollend', handleScrollEnd)
    }
  }, [currentImageIndex])

  // Sync scroll position with current index
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer || isScrolling.current) return

    const itemWidth = scrollContainer.offsetWidth
    scrollContainer.scrollTo({
      left: currentImageIndex * itemWidth,
      behavior: 'smooth'
    })
  }, [currentImageIndex])
  
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
      // The backend returns ISO date strings
      const date = new Date(dateString);
      const now = new Date()
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Recently listed'
      }
      
      // Calculate difference in calendar days, not 24-hour periods
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

  const handleScrollStart = () => {
    isScrolling.current = true
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on pagination buttons
    if (e.target instanceof HTMLElement && e.target.closest('.desktopNavButton')) {
      return
    }
    navigate(`/listing/${listing.id}`)
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
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
              onTouchStart={handleScrollStart}
              onMouseDown={handleScrollStart}
            >
              {images.map((image: string, index: number) => (
                <div key={index} className={styles.carouselSlide}>
                  <ImageWithFallback
                    src={image} 
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
                        setCurrentImageIndex(index)
                      }}
                    />
                  ))}
                </div>
                
                {/* Desktop navigation buttons */}
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
            <svg className={styles.locationIcon} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
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