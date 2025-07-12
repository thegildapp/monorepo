import styles from './ErrorState.module.css';

interface ErrorStateProps {
  title?: string;
  message: string;
}

export default function ErrorState({ title = "Oops!", message }: ErrorStateProps) {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorCard}>
        <h1 className={styles.errorTitle}>{title}</h1>
        <p className={styles.errorMessage}>{message}</p>
        <p className={styles.errorSubtext}>Please try again or contact support if the problem persists.</p>
      </div>
    </div>
  );
}