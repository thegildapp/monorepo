import React from 'react';
import styles from './Avatar.module.css';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'medium', className = '' }) => {
  const [imageError, setImageError] = React.useState(false);
  
  const getInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  const sizeClass = styles[size];

  return (
    <div className={`${styles.avatar} ${sizeClass} ${className}`}>
      {src && !imageError ? (
        <img 
          src={src} 
          alt={name}
          className={styles.image}
          onError={() => {
            setImageError(true);
          }}
        />
      ) : (
        <span className={styles.initial}>{getInitial(name)}</span>
      )}
    </div>
  );
};

export default Avatar;