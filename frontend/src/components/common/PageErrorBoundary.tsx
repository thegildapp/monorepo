import { useRouteError, useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import Header from '../layout/Header';
import Main from '../layout/Main';
import styles from './PageErrorBoundary.module.css';

export default function PageErrorBoundary() {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  console.error('Page error:', error);

  return (
    <Layout>
      <Header logoText="Gild" />
      <Main>
        <div className={styles.errorContainer}>
          <h1 className={styles.errorTitle}>Something went wrong</h1>
          <p className={styles.errorMessage}>
            We encountered an error while loading this page.
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className={styles.errorDetails}>
              <summary>Error details</summary>
              <pre className={styles.errorStack}>
                {error.message || error.toString()}
              </pre>
            </details>
          )}
          
          <div className={styles.errorActions}>
            <button
              onClick={() => navigate('/')}
              className={styles.homeButton}
            >
              Go to Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className={styles.reloadButton}
            >
              Try Again
            </button>
          </div>
        </div>
      </Main>
    </Layout>
  );
}