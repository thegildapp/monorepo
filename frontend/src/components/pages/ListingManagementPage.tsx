import { useParams, useNavigate } from 'react-router-dom';
import { useLazyLoadQuery, useFragment, useMutation } from 'react-relay';
import { useState, useEffect } from 'react';
import { graphql } from 'react-relay';
import Header from '../layout/Header';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import NotFound from '../feedback/NotFound';
import ImageWithFallback from '../common/ImageWithFallback';
import { useAuth } from '../../contexts/AuthContext';
import type { ListingManagementPageQuery as QueryType } from '../../__generated__/ListingManagementPageQuery.graphql';
import type { ListingManagementPage_listing$key } from '../../__generated__/ListingManagementPage_listing.graphql';
import styles from './ListingManagementPage.module.css';

const ManagementQuery = graphql`
  query ListingManagementPageQuery($id: ID!) {
    listing(id: $id) {
      ...ListingManagementPage_listing
    }
  }
`;

const ListingFragment = graphql`
  fragment ListingManagementPage_listing on Listing {
    id
    title
    description
    price
    images
    city
    state
    createdAt
    status
  }
`;

// Update mutation removed - using CreateListingModal for editing

const DeleteListingMutation = graphql`
  mutation ListingManagementPageDeleteMutation($id: ID!) {
    deleteListing(id: $id)
  }
`;

function ListingManagementView({ listingRef }: { listingRef: ListingManagementPage_listing$key }) {
  const listing = useFragment(ListingFragment, listingRef);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [commitDelete, isDeleting] = useMutation(DeleteListingMutation);
  
  // Note: In a real app, we'd check ownership through the backend
  // For now, we'll rely on backend authorization
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  const getDaysActive = (dateString: string) => {
    // The backend returns ISO date strings
    const date = new Date(dateString);
    const now = new Date();
    
    // Calculate difference in calendar days, not 24-hour periods
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfListingDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const days = Math.floor((startOfToday.getTime() - startOfListingDay.getTime()) / 86400000);
    return Math.max(0, days);
  };
  
  // Engagement metrics (mock data for now)
  const engagementData = {
    views: 156,
    saves: 12,
    shares: 3,
    inquiries: 2,
    viewsToday: 23,
    viewsThisWeek: 89,
    conversionRate: 1.3
  };
  
  const handleDelete = () => {
    commitDelete({
      variables: { id: listing.id },
      onCompleted: () => {
        navigate('/me');
      },
      onError: (error) => {
        alert('Failed to delete listing: ' + error.message);
      }
    });
  };
  
  
  return (
    <>
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.listingTitle}>{listing.title}</h1>
          <div className={styles.headerActions}>
            <button className={styles.viewButton} onClick={() => navigate(`/listing/${listing.id}`)}>
              View Listing
            </button>
            <button className={styles.editButton} onClick={() => navigate(`/listing/${listing.id}/edit`)}>
              Edit Details
            </button>
          </div>
        </div>
        
        {/* Engagement Overview */}
        <div className={styles.engagementSection}>
          <h2 className={styles.sectionTitle}>Engagement Overview</h2>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricValue}>{engagementData.views}</div>
              <div className={styles.metricLabel}>Total Views</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricValue}>{engagementData.saves}</div>
              <div className={styles.metricLabel}>Saves</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricValue}>{engagementData.shares}</div>
              <div className={styles.metricLabel}>Shares</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricValue}>{engagementData.inquiries}</div>
              <div className={styles.metricLabel}>Inquiries</div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <button
            className={styles.deleteButton}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Listing
          </button>
        </div>
        
        {showDeleteConfirm && (
          <div className={styles.deleteModal}>
            <div className={styles.deleteModalContent}>
              <h3>Delete Listing?</h3>
              <p>This action cannot be undone.</p>
              <div className={styles.deleteModalActions}>
                <button
                  className={styles.cancelDeleteButton}
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmDeleteButton}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function ListingManagementPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Always call hooks before any conditional returns
  const data = useLazyLoadQuery<QueryType>(
    ManagementQuery, 
    { id: itemId || '' },
    { fetchPolicy: itemId ? 'store-or-network' : 'store-only' }
  );
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin', { state: { from: `/listing/${itemId}/manage` } });
    }
  }, [user, navigate, itemId]);
  
  if (!itemId || !user) {
    return <NotFound />;
  }
  
  if (!data.listing) {
    return <NotFound />;
  }
  
  return (
    <Layout>
      <Header logoText="Gild" showSearch={false} />
      <Main>
        <ListingManagementView listingRef={data.listing} />
      </Main>
    </Layout>
  );
}