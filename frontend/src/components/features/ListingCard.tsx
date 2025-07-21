import { useState, useRef, useCallback, useEffect } from 'react'
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
  
  // New state for improved gesture handling
  const [touchStartY, setTouchStartY] = useState(0)
  const [touchStartTime, setTouchStartTime] = useState(0)
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState<boolean | null>(null)
  const [velocity, setVelocity] = useState(0)
  
  // Refs for performance optimization
  const rafId = useRef<number | null>(null)
  const lastTouchX = useRef(0)
  
  const images = listing.images?.length > 0 ? listing.images : []
  
  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [])
  
  // Add non-passive touch event listeners
  const imageContainerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const element = imageContainerRef.current
    if (!element) return
    
    const handleTouchMoveNonPassive = (e: TouchEvent) => {
      if (isHorizontalSwipe === true) {
        e.preventDefault()
      }
    }
    
    // Add non-passive listener
    element.addEventListener('touchmove', handleTouchMoveNonPassive, { passive: false })
    
    return () => {
      element.removeEventListener('touchmove', handleTouchMoveNonPassive)
    }
  }, [isHorizontalSwipe])
  
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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1) return
    
    const touch = e.targetTouches[0]
    setTouchStart(touch.clientX)
    setTouchStartY(touch.clientY)
    setTouchStartTime(Date.now())
    setIsDragging(true)
    setIsHorizontalSwipe(null) // Reset swipe direction
    setVelocity(0)
    setIsTransitioning(false) // Disable transitions during drag
  }

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || images.length <= 1) return
    
    const touch = e.targetTouches[0]
    const currentX = touch.clientX
    const currentY = touch.clientY
    
    // Store current touch position
    lastTouchX.current = currentX
    
    // Determine swipe direction if not yet determined
    if (isHorizontalSwipe === null) {
      const deltaX = Math.abs(currentX - touchStart)
      const deltaY = Math.abs(currentY - touchStartY)
      
      // Only determine direction after minimum movement (5px)
      if (deltaX > 5 || deltaY > 5) {
        // Use angle to determine intent (< 30 degrees from horizontal = horizontal swipe)
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI
        setIsHorizontalSwipe(angle < 30)
      }
    }
    
    // Only handle horizontal movement if horizontal swipe detected
    if (isHorizontalSwipe === true) {
      // Cancel any pending RAF
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
      
      // Use RAF for smooth updates
      rafId.current = requestAnimationFrame(() => {
        setTouchEnd(currentX)
        
        // Calculate velocity
        const timeDiff = Date.now() - touchStartTime
        const distance = currentX - touchStart
        if (timeDiff > 0) {
          setVelocity(distance / timeDiff)
        }
        
        // Calculate the drag distance with resistance at boundaries
        const diff = currentX - touchStart
        const resistance = 0.3
        
        if ((currentImageIndex === 0 && diff > 0) || 
            (currentImageIndex === images.length - 1 && diff < 0)) {
          setTranslateX(diff * resistance)
        } else {
          setTranslateX(diff)
        }
      })
    }
  }, [isDragging, images.length, isHorizontalSwipe, touchStart, touchStartY, touchStartTime, currentImageIndex])

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false)
    setIsTransitioning(true) // Re-enable transitions
    
    if (!touchStart || images.length <= 1 || isHorizontalSwipe === false) {
      setTranslateX(0)
      setIsHorizontalSwipe(null)
      return
    }
    
    // For horizontal swipes
    if (isHorizontalSwipe === true) {
      e.stopPropagation()
      
      const distance = touchStart - touchEnd
      const absDistance = Math.abs(distance)
      const absVelocity = Math.abs(velocity)
      
      // Velocity threshold for quick flicks (0.3 px/ms - more sensitive)
      const velocityThreshold = 0.3
      // Distance threshold for slower swipes (20% of container width - more sensitive)
      const distanceThreshold = imageContainerRef.current ? imageContainerRef.current.offsetWidth * 0.2 : window.innerWidth * 0.2
      
      // Change image if velocity is high OR distance is significant
      if (absVelocity > velocityThreshold || absDistance > distanceThreshold) {
        if (distance > 0 && currentImageIndex < images.length - 1) {
          // Swiped left - next image
          setCurrentImageIndex((prev) => prev + 1)
        } else if (distance < 0 && currentImageIndex > 0) {
          // Swiped right - previous image
          setCurrentImageIndex((prev) => prev - 1)
        }
      }
    }
    
    // Reset all values
    setTranslateX(0)
    setTouchStart(0)
    setTouchEnd(0)
    setTouchStartY(0)
    setIsHorizontalSwipe(null)
    setVelocity(0)
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
        ref={imageContainerRef}
        className={`${styles.listingImageContainer} ${isHorizontalSwipe === true ? styles.horizontalSwiping : ''}`}
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
                transition: isDragging ? 'none' : (isTransitioning ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none')
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