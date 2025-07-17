import { useParams } from 'react-router-dom';
import { useLazyLoadQuery, useFragment } from 'react-relay';
import { useState, useEffect } from 'react';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleImageClick = (e: React.MouseEvent) => {
    if (isMobile && !isDragging) {
      e.stopPropagation();
      setShowFullscreen(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1 || !isMobile) return;
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || images.length <= 1 || !isMobile) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    const diff = currentTouch - touchStart;
    setTranslateX(diff);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    setIsDragging(false);
    
    if (!touchStart || !touchEnd || images.length <= 1) {
      setTranslateX(0);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const threshold = 50;
    
    if (Math.abs(distance) > threshold) {
      if (distance > 0) {
        setCurrentImageIndex((prev) => Math.min(prev + 1, images.length - 1));
      } else {
        setCurrentImageIndex((prev) => Math.max(prev - 1, 0));
      }
      e.stopPropagation();
      e.preventDefault();
    }
    
    setTranslateX(0);
    setTouchStart(0);
    setTouchEnd(0);
  };

  const images = listing.images?.length > 0 ? listing.images : [];
  const hasImages = images.length > 0;
  const location = listing.city && listing.state ? `${listing.city}, ${listing.state}` : 'Location not available';

  return (
    <div className={styles.page}>
      {/* Image Gallery */}
      <div className={styles.imageGallery}>
        <div 
          className={styles.mainImageContainer}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleImageClick}
        >
          <div 
            className={styles.carouselTrack}
            style={isMobile ? {
              transform: `translateX(calc(-${currentImageIndex * 100}% + ${translateX}px))`,
              transition: isDragging ? 'none' : (isTransitioning ? 'transform 0.3s ease-out' : 'none')
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
        <div className={styles.fullscreenOverlay} onClick={() => setShowFullscreen(false)}>
          <button className={styles.fullscreenClose} onClick={() => setShowFullscreen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className={styles.fullscreenContent} onClick={(e) => e.stopPropagation()}>
            <div 
              className={styles.fullscreenCarousel}
              onTouchStart={(e) => {
                if (images.length <= 1) return;
                setTouchStart(e.targetTouches[0].clientX);
                setIsDragging(true);
              }}
              onTouchMove={(e) => {
                if (!isDragging || images.length <= 1) return;
                const currentTouch = e.targetTouches[0].clientX;
                setTouchEnd(currentTouch);
                const diff = currentTouch - touchStart;
                setTranslateX(diff);
              }}
              onTouchEnd={(e) => {
                setIsDragging(false);
                if (!touchStart || !touchEnd || images.length <= 1) {
                  setTranslateX(0);
                  return;
                }
                const distance = touchStart - touchEnd;
                const threshold = 50;
                if (Math.abs(distance) > threshold) {
                  if (distance > 0) {
                    setCurrentImageIndex((prev) => Math.min(prev + 1, images.length - 1));
                  } else {
                    setCurrentImageIndex((prev) => Math.max(prev - 1, 0));
                  }
                  e.stopPropagation();
                  e.preventDefault();
                }
                setTranslateX(0);
                setTouchStart(0);
                setTouchEnd(0);
              }}
            >
              <div 
                className={styles.fullscreenTrack}
                style={{
                  transform: `translateX(calc(-${currentImageIndex * 100}% + ${translateX}px))`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                }}
              >
                {images.map((image, index) => (
                  <ImageWithFallback
                    key={index}
                    src={image} 
                    alt={`${listing.title} - Image ${index + 1}`}
                    className={styles.fullscreenImage}
                  />
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