import { useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLazyLoadQuery, graphql } from 'react-relay';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import Header from '../layout/Header';
import ListingCard from '../features/ListingCard';
import { useAuth } from '../../contexts/AuthContext';
import type { ProfilePageMyListingsQuery } from '../../__generated__/ProfilePageMyListingsQuery.graphql';
import styles from './ProfilePage.module.css';

const MyListingsQuery = graphql`
  query ProfilePageMyListingsQuery {
    listings {
      id
      seller {
        id
      }
      ...ListingCard_listing
    }
  }
`;

function ProfilePageContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const data = useLazyLoadQuery<ProfilePageMyListingsQuery>(MyListingsQuery, {});

  // Filter listings to only show current user's listings
  const myListings = data.listings?.filter(listing => listing.seller.id === user?.id) || [];

  return (
    <>
      {myListings.length > 0 ? (
        <div className={styles.listingsGrid}>
          {myListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>You haven't created any listings yet</p>
          <button
            onClick={() => navigate('/me/new')}
            className={styles.createButton}
          >
            Create Your First Listing
          </button>
        </div>
      )}
    </>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <Header logoText="Gild" showSearch={false} />
      <Main>
        <div className={styles.container}>
          <div className={styles.profileContent}>
            <Suspense fallback={<div className={styles.loading}>Loading listings...</div>}>
              <ProfilePageContent />
            </Suspense>
          </div>
        </div>
      </Main>
    </Layout>
  );
}