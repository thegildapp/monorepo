import { useParams } from 'react-router-dom';
import { useLazyLoadQuery, useFragment } from 'react-relay';
import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../layout/Header';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import NotFound from '../feedback/NotFound';
import { GetListingQuery } from '../../queries/listings';
import type { listingsGetListingQuery as GetListingQueryType } from '../../__generated__/listingsGetListingQuery.graphql';
import type { listingsListingDetail_listing$key } from '../../__generated__/listingsListingDetail_listing.graphql';
import styles from './ItemPage.module.css';

import { ListingDetailFragment } from '../../queries/listings';
import ImageWithFallback from '../common/ImageWithFallback';
import ThumbnailImage from '../common/ThumbnailImage';

function ListingDetailView({ listingRef }: { listingRef: listingsListingDetail_listing$key }) {
  const listing = useFragment(ListingDetailFragment, listingRef);
  
  // Define images early to avoid reference errors
  const images = listing.images?.length > 0 ? listing.images : [];
  const hasImages = images.length > 0;
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  
  // Zoom state for fullscreen
  const [scale, setScale] = useState(1);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [lastDistance, setLastDistance] = useState(0);
  const [lastCenterX, setLastCenterX] = useState(0);
  const [lastCenterY, setLastCenterY] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  
  // New state for improved gesture handling
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState<boolean | null>(null);
  const [velocity, setVelocity] = useState(0);
  
  // Refs for performance optimization
  const rafId = useRef<number | null>(null);
  const lastTouchX = useRef(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);
  
  // Add non-passive touch event listeners
  useEffect(() => {
    const element = carouselRef.current;
    if (!element) return;
    
    const handleTouchMoveNonPassive = (e: TouchEvent) => {
      if (isHorizontalSwipe === true && scale === 1) {
        e.preventDefault();
      }
    };
    
    // Add non-passive listener
    element.addEventListener('touchmove', handleTouchMoveNonPassive, { passive: false });
    
    return () => {
      element.removeEventListener('touchmove', handleTouchMoveNonPassive);
    };
  }, [isHorizontalSwipe, scale]);

  // Prevent body scrolling on desktop
  useEffect(() => {
    if (!isMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.height = '';
      };
    }
  }, [isMobile]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!listing || !listing.images || listing.images.length <= 1 || isMobile) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentImageIndex === 0) {
          setIsTransitioning(false);
          setCurrentImageIndex(listing.images.length - 1);
          setTimeout(() => setIsTransitioning(true), 50);
        } else {
          setCurrentImageIndex(currentImageIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentImageIndex === listing.images.length - 1) {
          setIsTransitioning(false);
          setCurrentImageIndex(0);
          setTimeout(() => setIsTransitioning(true), 50);
        } else {
          setCurrentImageIndex(currentImageIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listing, isMobile, currentImageIndex]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Helper function to get distance between two touch points
  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Helper function to get center point between two touches
  const getCenter = (touches: React.TouchList) => {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  };

  // Constrain position within boundaries
  const constrainPosition = (x: number, y: number, currentScale: number) => {
    const maxX = (currentScale - 1) * window.innerWidth / 2;
    const maxY = (currentScale - 1) * window.innerHeight / 2;
    
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (isMobile && !isDragging) {
      e.stopPropagation();
      setShowFullscreen(true);
      // Reset zoom state when opening fullscreen
      setScale(1);
      setPosX(0);
      setPosY(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1 || !isMobile) return;
    
    const touch = e.targetTouches[0];
    setTouchStart(touch.clientX);
    setTouchStartY(touch.clientY);
    setTouchStartTime(Date.now());
    setIsDragging(true);
    setIsHorizontalSwipe(null); // Reset swipe direction
    setVelocity(0);
    setIsTransitioning(false); // Disable transitions during drag
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || images.length <= 1 || !isMobile || scale > 1) return;
    
    const touch = e.targetTouches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    
    // Store current touch position
    lastTouchX.current = currentX;
    
    // Determine swipe direction if not yet determined
    if (isHorizontalSwipe === null) {
      const deltaX = Math.abs(currentX - touchStart);
      const deltaY = Math.abs(currentY - touchStartY);
      
      // Only determine direction after minimum movement (5px)
      if (deltaX > 5 || deltaY > 5) {
        // Use angle to determine intent (< 30 degrees from horizontal = horizontal swipe)
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        setIsHorizontalSwipe(angle < 30);
      }
    }
    
    // Only handle horizontal movement if horizontal swipe detected
    if (isHorizontalSwipe === true) {
      // Cancel any pending RAF
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      
      // Use RAF for smooth updates
      rafId.current = requestAnimationFrame(() => {
        setTouchEnd(currentX);
        
        // Calculate velocity
        const timeDiff = Date.now() - touchStartTime;
        const distance = currentX - touchStart;
        if (timeDiff > 0) {
          setVelocity(distance / timeDiff);
        }
        
        // Calculate the drag distance with resistance at boundaries
        const diff = currentX - touchStart;
        const resistance = 0.3;
        
        if ((currentImageIndex === 0 && diff > 0) || 
            (currentImageIndex === images.length - 1 && diff < 0)) {
          setTranslateX(diff * resistance);
        } else {
          setTranslateX(diff);
        }
      });
    }
  }, [isDragging, images.length, isMobile, scale, isHorizontalSwipe, touchStart, touchStartY, touchStartTime, currentImageIndex]);

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    setIsDragging(false);
    setIsTransitioning(true); // Re-enable transitions
    
    if (!touchStart || images.length <= 1 || isHorizontalSwipe === false || scale > 1) {
      setTranslateX(0);
      setIsHorizontalSwipe(null);
      return;
    }
    
    // For horizontal swipes
    if (isHorizontalSwipe === true) {
      e.stopPropagation();
      
      const distance = touchStart - touchEnd;
      const absDistance = Math.abs(distance);
      const absVelocity = Math.abs(velocity);
      
      // Velocity threshold for quick flicks (0.5 px/ms)
      const velocityThreshold = 0.5;
      // Distance threshold for slower swipes (30% of container width)
      const distanceThreshold = window.innerWidth * 0.3;
      
      // Change image if velocity is high OR distance is significant
      if (absVelocity > velocityThreshold || absDistance > distanceThreshold) {
        if (distance > 0 && currentImageIndex < images.length - 1) {
          // Swiped left - next image
          setCurrentImageIndex((prev) => prev + 1);
          // Reset zoom when changing images
          setScale(1);
          setPosX(0);
          setPosY(0);
        } else if (distance < 0 && currentImageIndex > 0) {
          // Swiped right - previous image
          setCurrentImageIndex((prev) => prev - 1);
          // Reset zoom when changing images
          setScale(1);
          setPosX(0);
          setPosY(0);
        }
      }
    }
    
    // Reset all values
    setTranslateX(0);
    setTouchStart(0);
    setTouchEnd(0);
    setTouchStartY(0);
    setIsHorizontalSwipe(null);
    setVelocity(0);
  };

  const location = listing.city && listing.state ? `${listing.city}, ${listing.state}` : 'Location not available';

  return (
    <div className={styles.page}>
      {/* Image Gallery */}
      <div className={styles.imageGallery}>
        <div 
          ref={carouselRef}
          className={`${styles.mainImageContainer} ${isHorizontalSwipe === true ? styles.horizontalSwiping : ''}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleImageClick}
        >
          <div 
            className={styles.carouselTrack}
            style={isMobile ? {
              transform: `translateX(calc(-${currentImageIndex * 100}% + ${translateX}px)) ${isDragging && isHorizontalSwipe ? 'scale(0.95)' : 'scale(1)'}`,
              transition: isDragging ? 'transform 0.1s ease-out' : (isTransitioning ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none')
            } : {}}
          >
            {images.length > 0 ? (
              isMobile ? (
                images.map((image, index) => (
                  <ImageWithFallback
                    key={index}
                    src={image} 
                    alt={`${listing.title} - Image ${index + 1}`}
                    className={styles.mainImage}
                    fallbackWidth="100%"
                    fallbackHeight="300px"
                  />
                ))
              ) : (
                <ImageWithFallback
                  key={currentImageIndex}
                  src={images[currentImageIndex]} 
                  alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                  className={styles.mainImage}
                  fallbackWidth="600px"
                  fallbackHeight="400px"
                />
              )
            ) : (
              <div className={`${styles.mainImage} ${styles.imagePlaceholder}`}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>No images available</span>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnails - desktop only */}
        {!isMobile && hasImages && images.length > 1 && (
          <div className={styles.thumbnailContainer}>
            {images.map((image, index) => (
              <div
                key={index}
                className={`${styles.thumbnail} ${index === currentImageIndex ? styles.active : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <ThumbnailImage
                  src={image} 
                  alt={`${listing.title} thumbnail ${index + 1}`}
                  className={styles.thumbnailImage}
                />
              </div>
            ))}
          </div>
        )}

        {/* Mobile indicators */}
        {isMobile && hasImages && images.length > 1 && (
          <div className={styles.mobileIndicators}>
            {images.map((_, index) => (
              <div
                key={index}
                className={`${styles.indicator} ${index === currentImageIndex ? styles.active : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>{listing.title}</h1>
          <p className={styles.price}>{formatPrice(listing.price)}</p>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Description</h2>
          <p className={styles.description}>{listing.description}</p>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Location</h2>
          <div className={styles.location}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={styles.locationIcon}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{location}</span>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Seller</h2>
          <div className={styles.seller}>
            <div className={styles.sellerAvatar}>
              {listing.seller.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className={styles.sellerName}>{listing.seller.name || 'Unknown'}</span>
          </div>
        </div>

      </div>

      {/* Fullscreen Image Viewer */}
      {showFullscreen && (
        <div className={styles.fullscreenOverlay} onClick={() => {
          if (scale === 1) setShowFullscreen(false);
        }}>
          <button className={styles.fullscreenClose} onClick={() => setShowFullscreen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className={styles.fullscreenContent} onClick={(e) => e.stopPropagation()}>
            <div 
              className={styles.fullscreenCarousel}
              onTouchStart={(e) => {
                const touches = e.touches;
                
                if (touches.length === 2) {
                  // Pinch gesture start
                  setIsZooming(true);
                  setLastDistance(getDistance(touches));
                  const center = getCenter(touches);
                  setLastCenterX(center.x);
                  setLastCenterY(center.y);
                } else if (touches.length === 1) {
                  if (scale > 1) {
                    // Pan when zoomed
                    setIsPanning(true);
                    setLastCenterX(touches[0].clientX - posX);
                    setLastCenterY(touches[0].clientY - posY);
                  } else {
                    // Swipe between images when not zoomed
                    setTouchStart(touches[0].clientX);
                    setIsDragging(true);
                  }
                }
              }}
              onTouchMove={(e) => {
                const touches = e.touches;
                
                if (touches.length === 2 && isZooming) {
                  // Pinch zoom
                  const distance = getDistance(touches);
                  const center = getCenter(touches);
                  
                  let newScale = scale * (distance / lastDistance);
                  newScale = Math.max(1, Math.min(4, newScale));
                  
                  // Adjust position to zoom towards pinch center
                  const scaleChange = newScale / scale;
                  const newPosX = posX * scaleChange + (center.x - lastCenterX) * (1 - scaleChange);
                  const newPosY = posY * scaleChange + (center.y - lastCenterY) * (1 - scaleChange);
                  
                  const constrained = constrainPosition(newPosX, newPosY, newScale);
                  
                  setScale(newScale);
                  setPosX(constrained.x);
                  setPosY(constrained.y);
                  setLastDistance(distance);
                  setLastCenterX(center.x);
                  setLastCenterY(center.y);
                } else if (touches.length === 1) {
                  if (isPanning && scale > 1) {
                    // Pan
                    const newPosX = touches[0].clientX - lastCenterX;
                    const newPosY = touches[0].clientY - lastCenterY;
                    const constrained = constrainPosition(newPosX, newPosY, scale);
                    setPosX(constrained.x);
                    setPosY(constrained.y);
                  } else if (isDragging && scale === 1) {
                    // Swipe between images
                    const currentTouch = touches[0].clientX;
                    setTouchEnd(currentTouch);
                    const diff = currentTouch - touchStart;
                    
                    // Add resistance at boundaries
                    const resistance = 0.3;
                    if ((currentImageIndex === 0 && diff > 0) || 
                        (currentImageIndex === images.length - 1 && diff < 0)) {
                      setTranslateX(diff * resistance);
                    } else {
                      setTranslateX(diff);
                    }
                  }
                }
              }}
              onTouchEnd={(e) => {
                setIsZooming(false);
                setIsPanning(false);
                
                // Double tap to zoom
                if (e.timeStamp - lastTapTime < 300) {
                  if (scale === 1) {
                    setScale(2);
                    const touch = e.changedTouches[0];
                    const newPosX = (window.innerWidth / 2 - touch.clientX) * 1;
                    const newPosY = (window.innerHeight / 2 - touch.clientY) * 1;
                    const constrained = constrainPosition(newPosX, newPosY, 2);
                    setPosX(constrained.x);
                    setPosY(constrained.y);
                  } else {
                    setScale(1);
                    setPosX(0);
                    setPosY(0);
                  }
                }
                setLastTapTime(e.timeStamp);
                
                if (isDragging && scale === 1) {
                  setIsDragging(false);
                  if (!touchStart || !touchEnd || images.length <= 1) {
                    setTranslateX(0);
                    return;
                  }
                  
                  const distance = touchStart - touchEnd;
                  const threshold = 50;
                  
                  if (Math.abs(distance) > threshold) {
                    if (distance > 0 && currentImageIndex < images.length - 1) {
                      setCurrentImageIndex(currentImageIndex + 1);
                      // Reset zoom when changing images
                      setScale(1);
                      setPosX(0);
                      setPosY(0);
                    } else if (distance < 0 && currentImageIndex > 0) {
                      setCurrentImageIndex(currentImageIndex - 1);
                      // Reset zoom when changing images
                      setScale(1);
                      setPosX(0);
                      setPosY(0);
                    }
                  }
                  
                  setTranslateX(0);
                  setTouchStart(0);
                  setTouchEnd(0);
                }
              }}
            >
              <div 
                className={styles.fullscreenTrack}
                style={{
                  transform: `translateX(calc(-${currentImageIndex * 100}% + ${translateX}px))`,
                  transition: isDragging || isZooming || isPanning ? 'none' : 'transform 0.3s ease-out'
                }}
              >
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={styles.fullscreenImageWrapper}
                    style={{
                      transform: index === currentImageIndex ? `scale(${scale}) translate(${posX / scale}px, ${posY / scale}px)` : '',
                      transition: isZooming || isPanning ? 'none' : 'transform 0.3s ease-out'
                    }}
                  >
                    <ImageWithFallback
                      src={image} 
                      alt={`${listing.title} - Image ${index + 1}`}
                      className={styles.fullscreenImage}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ItemPage() {
  const { itemId } = useParams<{ itemId: string }>();
  
  // Reset scroll position on mount and when itemId changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [itemId]);
  
  if (!itemId) {
    return <NotFound />;
  }

  const data = useLazyLoadQuery<GetListingQueryType>(GetListingQuery, {
    id: itemId
  });

  // Check if item exists
  if (!data.listing) {
    return <NotFound />;
  }

  return (
    <Layout>
      <Header 
        logoText="Gild"
        showSearch={false}
      />
      <Main>
        <ListingDetailView listingRef={data.listing} />
      </Main>
    </Layout>
  );
}