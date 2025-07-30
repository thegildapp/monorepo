import { useParams, useNavigate } from 'react-router-dom';
import { useLazyLoadQuery, useFragment, useMutation } from 'react-relay';
import { useState, useEffect } from 'react';
import { graphql } from 'react-relay';
import Header from '../layout/Header';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import NotFound from '../feedback/NotFound';
import ImageWithFallback from '../common/ImageWithFallback';
import Button from '../common/Button';
import InquiryCard from '../features/InquiryCard';
import { useAuth } from '../../contexts/AuthContext';
import { RespondToInquiryMutation } from '../../queries/inquiries';
import type { ListingManagementPageQuery as QueryType } from '../../__generated__/ListingManagementPageQuery.graphql';
import type { ListingManagementPage_listing$key } from '../../__generated__/ListingManagementPage_listing.graphql';
import type { inquiriesRespondToInquiryMutation } from '../../__generated__/inquiriesRespondToInquiryMutation.graphql';
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
    viewCount
    inquiries {
      id
      status
      buyer {
        id
        name
        avatarUrl
      }
      seller {
        id
        name
      }
      listing {
        id
        title
      }
      contactEmail
      contactPhone
      createdAt
      respondedAt
    }
  }
`;

// Update mutation removed - using CreateListingModal for editing


function ListingManagementView({ listingRef }: { listingRef: ListingManagementPage_listing$key }) {
  const listing = useFragment(ListingFragment, listingRef);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  
  const [commitRespond, isResponding] = useMutation<inquiriesRespondToInquiryMutation>(RespondToInquiryMutation);
  
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
  
  const daysActive = getDaysActive(listing.createdAt);
  
  const pendingInquiries = listing.inquiries?.filter(inq => inq.status === 'PENDING') || [];
  const acceptedInquiries = listing.inquiries?.filter(inq => inq.status === 'ACCEPTED') || [];
  const rejectedInquiries = listing.inquiries?.filter(inq => inq.status === 'REJECTED') || [];
  
  
  const handleRespondToInquiry = (inquiryId: string, accept: boolean) => {
    commitRespond({
      variables: {
        inquiryId,
        accept,
        shareEmail: accept,
        sharePhone: false
      },
      onCompleted: (response) => {
        if (response.respondToInquiry.errors && response.respondToInquiry.errors.length > 0) {
          alert(response.respondToInquiry.errors[0].message);
        }
      },
      onError: (error) => {
        alert('Failed to respond to inquiry: ' + error.message);
      }
    });
  };
  
  
  
  return (
    <>
      <div className={styles.dashboardContainer}>
        <div className={styles.listingHeader}>
          <div className={styles.listingThumbnail}>
            {listing.images && listing.images.length > 0 ? (
              <ImageWithFallback
                src={listing.images[0]}
                alt={listing.title}
                className={styles.thumbnail}
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            )}
          </div>
          <div className={styles.listingDetails}>
            <h1 className={styles.listingTitle}>{listing.title}</h1>
            <div className={styles.listingMeta}>
              <span className={styles.listingPrice}>{formatPrice(listing.price)}</span>
              <span className={styles.separator}>•</span>
              <span className={styles.listingLocation}>{listing.city}, {listing.state}</span>
              <span className={styles.separator}>•</span>
              <span className={styles.viewCount}>{listing.viewCount || 0} {listing.viewCount === 1 ? 'view' : 'views'}</span>
              <span className={styles.separator}>•</span>
              <span className={styles.daysActive}>{daysActive} {daysActive === 1 ? 'day' : 'days'} active</span>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Button 
              variant="secondary" 
              onClick={() => navigate(`/listing/${listing.id}`)}
            >
              View Listing
            </Button>
            <Button 
              variant="primary" 
              onClick={() => navigate(`/listing/${listing.id}/edit`)}
            >
              Edit Details
            </Button>
          </div>
        </div>
        
        {/* Inquiries Section */}
        <div className={styles.inquiriesSection}>
          <h2 className={styles.sectionTitle}>Inquiries</h2>
          
          {pendingInquiries.length === 0 && acceptedInquiries.length === 0 && rejectedInquiries.length === 0 ? (
            <div className={styles.noInquiries}>
              <p>No inquiries yet</p>
              <p className={styles.noInquiriesSubtext}>When buyers send inquiries, they will appear here</p>
            </div>
          ) : (
            <>
              {/* Pending Inquiries */}
              {pendingInquiries.length > 0 && (
                <div className={styles.inquiryGroup}>
                  <h3 className={styles.inquiryGroupTitle}>Pending</h3>
                  <div className={styles.inquiryGrid}>
                    {pendingInquiries.map((inquiry) => (
                      <InquiryCard
                        key={inquiry.id}
                        inquiry={inquiry}
                        onAccept={(id) => handleRespondToInquiry(id, true)}
                        onReject={(id) => handleRespondToInquiry(id, false)}
                        isResponding={isResponding}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Accepted Inquiries */}
              {acceptedInquiries.length > 0 && (
                <div className={styles.inquiryGroup}>
                  <h3 className={styles.inquiryGroupTitle}>Accepted</h3>
                  <div className={styles.inquiryGrid}>
                    {acceptedInquiries.map((inquiry) => (
                      <InquiryCard
                        key={inquiry.id}
                        inquiry={inquiry}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
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