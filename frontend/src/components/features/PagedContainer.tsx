import React from 'react';
import styles from './PagedContainer.module.css';

interface PagedContainerProps {
  pages: React.ReactNode[];
  currentPage: number;
  onPageChange: (page: number) => void;
  canProceed: boolean;
  onCancel: () => void;
  onFinish: () => void;
  isLastPage: boolean;
}

const PagedContainer: React.FC<PagedContainerProps> = ({
  pages,
  currentPage,
  onPageChange,
  canProceed,
  onCancel,
  onFinish,
  isLastPage
}) => {
  const handleNext = () => {
    if (isLastPage) {
      onFinish();
    } else if (canProceed) {
      onPageChange(currentPage + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
          />
        </div>
        
        <button 
          className={styles.closeButton} 
          onClick={onCancel}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className={styles.content}>
        {pages[currentPage]}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.backButton}
          onClick={handleBack}
          disabled={currentPage === 0}
        >
          Back
        </button>
        
        <button
          className={`${styles.nextButton} ${canProceed ? '' : styles.disabled}`}
          onClick={handleNext}
          disabled={!canProceed}
        >
          {isLastPage ? 'Create Listing' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default PagedContainer;