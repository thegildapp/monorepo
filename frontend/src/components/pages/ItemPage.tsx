import { useParams } from 'react-router-dom';
import { useLazyLoadQuery, useFragment } from 'react-relay';
import { useState, useEffect, useRef } from 'react';
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
  
  // Helper functions to get appropriate image variants
  const getFullImageUrl = (index: number) => {
    if (listing.imageVariants && listing.imageVariants[index]) {
      return listing.imageVariants[index].full;
    }
    return images[index];
  };
  
  const getThumbnailUrl = (index: number) => {
    if (listing.imageVariants && listing.imageVariants[index]) {
      return listing.imageVariants[index].thumbnail;
    }
    return images[index];
  };
  
  const [isMobile, setIsMobile] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [desktopImageIndex, setDesktopImageIndex] = useState(0);
  
  const fullscreenScrollRef = useRef<HTMLDivElement>(null);
  const [fullscreenScrollPosition, setFullscreenScrollPosition] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const getCurrentIndex = (isFullscreen = false) => {
    const scrollPos = isFullscreen ? fullscreenScrollPosition : scrollPosition;
    const scrollContainer = isFullscreen ? fullscreenScrollRef.current : scrollContainerRef.current;
    
    if (!scrollContainer || images.length === 0) return 0;
    
    const itemWidth = scrollContainer.offsetWidth;
    if (itemWidth === 0) return 0;
    
    return Math.min(
      Math.round(scrollPos / itemWidth),
      images.length - 1
    );
  };
  
  const mobileImageIndex = getCurrentIndex(false);
  const fullscreenImageIndex = getCurrentIndex(true);
  
  const currentImageIndex = isMobile ? mobileImageIndex : desktopImageIndex;
  
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !isMobile) return;

    const handleScroll = () => {
      setScrollPosition(scrollContainer.scrollLeft);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [isMobile]);
  
  const scrollToIndex = (index: number, isFullscreen = false) => {
    if (!isMobile && !isFullscreen) {
      setDesktopImageIndex(index);
    } else {
      const scrollContainer = isFullscreen ? fullscreenScrollRef.current : scrollContainerRef.current;
      if (!scrollContainer) return;
      
      const itemWidth = scrollContainer.offsetWidth;
      scrollContainer.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const scrollContainer = fullscreenScrollRef.current;
    if (!scrollContainer || !showFullscreen) return;

    const handleScroll = () => {
      setFullscreenScrollPosition(scrollContainer.scrollLeft);
    };

    scrollContainer.addEventListener('scroll', handleScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [showFullscreen]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!listing || !listing.images || listing.images.length <= 1 || isMobile) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = desktopImageIndex === 0 ? listing.images.length - 1 : desktopImageIndex - 1;
        setDesktopImageIndex(prevIndex);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = desktopImageIndex === listing.images.length - 1 ? 0 : desktopImageIndex + 1;
        setDesktopImageIndex(nextIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listing, isMobile, desktopImageIndex]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };


  const handleImageClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.stopPropagation();
      setShowFullscreen(true);
    }
  };



  const location = listing.city && listing.state ? `${listing.city}, ${listing.state}` : 'Location not available';

  return (
    <div className={styles.page}>
      {/* Image Gallery */}
      <div className={styles.imageGallery}>
        {isMobile ? (
          // Mobile: Native scroll carousel
          <div 
            ref={scrollContainerRef}
            className={styles.carouselScrollContainer}
            onClick={handleImageClick}
          >
            {images.length > 0 ? (
              images.map((_, index) => (
                <div key={index} className={styles.carouselSlide}>
                  <ImageWithFallback
                    src={getFullImageUrl(index)} 
                    alt={`${listing.title} - Image ${index + 1}`}
                    className={styles.mainImage}
                    fallbackWidth="100%"
                    fallbackHeight="300px"
                  />
                </div>
              ))
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
        ) : (
          <div className={styles.mainImageContainer}>
            {images.length > 0 ? (
              <ImageWithFallback
                key={currentImageIndex}
                src={getFullImageUrl(currentImageIndex)} 
                alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                className={styles.mainImage}
                fallbackWidth="600px"
                fallbackHeight="400px"
              />
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
        )}

        {/* Thumbnails - desktop only */}
        {!isMobile && hasImages && images.length > 1 && (
          <div className={styles.thumbnailContainer}>
            {images.map((_, index) => (
              <div
                key={index}
                className={`${styles.thumbnail} ${index === currentImageIndex ? styles.active : ''}`}
                onClick={() => scrollToIndex(index)}
              >
                <ThumbnailImage
                  src={getThumbnailUrl(index)} 
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
                onClick={() => scrollToIndex(index)}
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

      {showFullscreen && (
        <div className={styles.fullscreenOverlay} onClick={() => setShowFullscreen(false)}>
          <button className={styles.fullscreenClose} onClick={() => setShowFullscreen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className={styles.fullscreenContent} onClick={(e) => e.stopPropagation()}>
            <div 
              ref={fullscreenScrollRef}
              className={styles.fullscreenScrollContainer}
            >
              {images.map((_, index) => (
                <div
                  key={index}
                  className={styles.fullscreenSlide}
                >
                  <ImageWithFallback
                    src={getFullImageUrl(index)} 
                    alt={`${listing.title} - Image ${index + 1}`}
                    className={styles.fullscreenImage}
                  />
                </div>
              ))}
            </div>
            {images.length > 1 && (
              <div className={styles.fullscreenIndicators}>
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`${styles.fullscreenIndicator} ${index === fullscreenImageIndex ? styles.active : ''}`}
                    onClick={() => {
                      const scrollContainer = fullscreenScrollRef.current;
                      if (scrollContainer) {
                        const itemWidth = scrollContainer.offsetWidth;
                        scrollContainer.scrollTo({
                          left: index * itemWidth,
                          behavior: 'smooth'
                        });
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ItemPage() {
  const { itemId } = useParams<{ itemId: string }>();
  
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