import { useState } from 'react'
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
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [translateX, setTranslateX] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)
  
  const images = listing.images?.length > 0 ? listing.images : []
  
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
      let date: Date;
      
      // Check if it's a timestamp string
      if (/^\d+$/.test(dateString)) {
        date = new Date(parseInt(dateString));
      } else {
        date = new Date(dateString);
      }
      
      const now = new Date()
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Recently listed'
      }
      
      const days = Math.floor((now.getTime() - date.getTime()) / 86400000)
      
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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1) return
    setTouchStart(e.targetTouches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || images.length <= 1) return
    
    const currentTouch = e.targetTouches[0].clientX
    setTouchEnd(currentTouch)
    
    // Calculate the drag distance and update translateX
    const diff = currentTouch - touchStart
    setTranslateX(diff)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false)
    
    if (!touchStart || !touchEnd || images.length <= 1) {
      setTranslateX(0)
      return
    }
    
    const distance = touchStart - touchEnd
    const threshold = 50 // minimum distance for a swipe
    
    if (Math.abs(distance) > threshold) {
      if (distance > 0) {
        // Swiped left - next image
        setCurrentImageIndex((prev) => Math.min(prev + 1, images.length - 1))
      } else {
        // Swiped right - previous image
        setCurrentImageIndex((prev) => Math.max(prev - 1, 0))
      }
      e.stopPropagation()
      e.preventDefault()
    }
    
    // Reset transform and touch values
    setTranslateX(0)
    setTouchStart(0)
    setTouchEnd(0)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on the image during swipe or on pagination buttons
    if (e.target instanceof HTMLElement && e.target.closest('.listingImageContainer')) {
      if (isDragging || Math.abs(translateX) >= 5 || e.target.closest('.desktopNavButton')) {
        return
      }
    }
    navigate(`/listing/${listing.id}`)
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentImageIndex === 0) {
      // Jump without transition
      setIsTransitioning(false)
      setCurrentImageIndex(images.length - 1)
      // Re-enable transition after a brief delay
      setTimeout(() => setIsTransitioning(true), 50)
    } else {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentImageIndex === images.length - 1) {
      // Jump without transition
      setIsTransitioning(false)
      setCurrentImageIndex(0)
      // Re-enable transition after a brief delay
      setTimeout(() => setIsTransitioning(true), 50)
    } else {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  return (
    <div className={styles.listingCard}>
      <div 
        className={styles.listingImageContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {images[0] ? (
          <>
            <div 
              className={styles.carouselTrack}
              style={{
                transform: `translateX(calc(-${currentImageIndex * 100}% + ${translateX}px))`,
                transition: isDragging ? 'none' : (isTransitioning ? 'transform 0.3s ease-out' : 'none')
              }}
            >
              {images.map((image: string, index: number) => (
                <ImageWithFallback
                  key={index}
                  src={image} 
                  alt={`${listing.title} - Image ${index + 1}`}
                  className={styles.listingImage}
                />
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
                      className={`${styles.desktopNavButton} ${styles.prev}`}
                      onClick={handlePrevImage}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      className={`${styles.desktopNavButton} ${styles.next}`}
                      onClick={handleNextImage}
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
            {listing.city && listing.state && (
              <span className={styles.listingLocation}>
                {listing.city}, {listing.state}
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