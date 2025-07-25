import { useEffect, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLazyLoadQuery, graphql } from 'react-relay';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import Header from '../layout/Header';
import SellerListingCard from '../features/SellerListingCard';
import SellerLoadingGrid from '../features/SellerLoadingGrid';
import CreateListingModal from '../features/CreateListingModal';
import { useAuth } from '../../contexts/AuthContext';
import type { ProfilePageMyListingsQuery } from '../../__generated__/ProfilePageMyListingsQuery.graphql';
import styles from './ProfilePage.module.css';

const MyListingsQuery = graphql`
  query ProfilePageMyListingsQuery {
    myListings {
      id
      ...ListingCard_listing
      ...SellerListingCard_listing
    }
  }
`;

function ProfilePageContent({ onCreateClick }: { onCreateClick: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const data = useLazyLoadQuery<ProfilePageMyListingsQuery>(
    MyListingsQuery, 
    {},
    { fetchPolicy: 'store-and-network' }
  );

  // Get user's listings directly from myListings query
  const myListings = data.myListings || [];

  return (
    <>
      {myListings.length > 0 ? (
        <>
          <h1 className={styles.pageTitle}>My Listings</h1>
          <div className={styles.sellerListingsContainer}>
            {myListings.map((listing) => (
              <SellerListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>You haven't created any listings yet</p>
          <button
            onClick={onCreateClick}
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateSuccess = () => {
    // Modal will close itself and ProfilePageContent will refetch due to relay updater
  };

  return (
    <Layout>
      <Header logoText="Gild" showSearch={false} onListClick={handleCreateClick} />
      <Main>
        <div className={styles.container}>
          <div className={styles.profileContent}>
            <Suspense fallback={<SellerLoadingGrid />}>
              <ProfilePageContent onCreateClick={handleCreateClick} />
            </Suspense>
          </div>
        </div>
      </Main>
      
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSuccess={handleCreateSuccess}
      />
    </Layout>
  );
}