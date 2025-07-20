import React, { useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showHeader?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showHeader = true,
  className = ''
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.overlay} onClick={onClose} />
      <div className={`${styles.content} ${styles[size]} ${className}`}>
        {showHeader && (
          <div className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            <button 
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M6 6l12 12M6 18L18 6" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;