import Layout from '../layout/Layout';
import Main from '../layout/Main';
import Header from '../layout/Header';
import styles from './CreateListingPage.module.css';

export default function CreateListingPage() {
  return (
    <Layout>
      <Header logoText="Gild" showSearch={false} />
      <Main>
        <div className={styles.container}>
          <div className={styles.content}>
            <h1 className={styles.title}>Create New Listing</h1>
            {/* Form will go here */}
          </div>
        </div>
      </Main>
    </Layout>
  );
}