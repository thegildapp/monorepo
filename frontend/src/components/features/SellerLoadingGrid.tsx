import styles from './SellerLoadingGrid.module.css';

const SellerLoadingGrid: React.FC = () => {
  return (
    <div className={styles.sellerListingsContainer}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={styles.loadingCard}>
          <div className={styles.imageSection} />
          <div className={styles.contentSection}>
            <div className={styles.loadingTitle} />
            <div className={styles.loadingMeta}>
              <div className={styles.loadingLocation} />
              <div className={styles.loadingStats} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SellerLoadingGrid;