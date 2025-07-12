import { useState } from 'react';
import styles from './ThumbnailImage.module.css';

interface ThumbnailImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ThumbnailImage({ src, alt, className = '' }: ThumbnailImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`${className} ${styles.thumbnailPlaceholder}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
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