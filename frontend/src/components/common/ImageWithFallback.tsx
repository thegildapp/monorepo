import { useState } from 'react';
import styles from './ImageWithFallback.module.css';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackWidth?: string | number;
  fallbackHeight?: string | number;
}

export default function ImageWithFallback({ 
  src, 
  alt, 
  className = '', 
  fallbackWidth,
  fallbackHeight 
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    const fallbackStyle = {
      ...(fallbackWidth && { minWidth: fallbackWidth, width: fallbackWidth }),
      ...(fallbackHeight && { minHeight: fallbackHeight, height: fallbackHeight })
    };

    return (
      <div className={`${styles.imagePlaceholder}`} style={fallbackStyle}>
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
    <img 
      src={src} 
      alt={alt}
      className={className}
      draggable={false}
      onError={() => setHasError(true)}
    />
  );
}