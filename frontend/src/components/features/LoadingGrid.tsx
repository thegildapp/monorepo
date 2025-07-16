import styles from './ListingGrid.module.css';

const LoadingGrid: React.FC = () => {
  return (
    <div className={styles.listingGridContainer}>
      <div className={styles.listingGrid}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={styles.loadingCard}>
            <div className={styles.loadingImage} />
            <div className={styles.loadingContent}>
              <div className={styles.loadingTitle} />
              <div className={styles.loadingPrice} />
              <div className={styles.loadingMeta} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingGrid;