import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundCard}>
        <h1 className={styles.notFoundTitle}>404</h1>
        <p className={styles.notFoundMessage}>Page not found</p>
      </div>
    </div>
  );
}