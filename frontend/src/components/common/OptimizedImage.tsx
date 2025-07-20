import { useState, useEffect, useRef } from 'react';
import styles from './OptimizedImage.module.css';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

// Simple in-memory cache for loaded images
const imageCache = new Set<string>();

// Generate srcset for responsive images
function generateSrcSet(baseUrl: string): string {
  // For Digital Ocean Spaces, we can use query params for image transformation
  // If not supported, return original URL
  const widths = [320, 640, 768, 1024, 1280, 1920];
  
  // Check if URL is from Digital Ocean Spaces
  if (!baseUrl.includes('digitaloceanspaces.com')) {
    return '';
  }
  
  // For now, return empty srcset as DO Spaces doesn't support on-the-fly resizing
  // In production, you'd want to generate multiple sizes during upload
  return '';
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  sizes = '100vw',
  priority = false,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Use Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px' // Start loading 50px before image enters viewport
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Check if image is already cached
  useEffect(() => {
    if (imageCache.has(src)) {
      setIsLoading(false);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    imageCache.add(src);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div 
        className={`${className} ${styles.imagePlaceholder}`}
        style={{ width, height }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>Image not available</span>
      </div>
    );
  }

  return (
    <div className={`${styles.imageWrapper} ${className}`} style={{ width, height }}>
      {/* Blur placeholder while loading */}
      {isLoading && (
        <div className={styles.placeholder} aria-hidden="true">
          <div className={styles.shimmer} />
        </div>
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        className={`${styles.image} ${isLoading ? styles.loading : styles.loaded}`}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}