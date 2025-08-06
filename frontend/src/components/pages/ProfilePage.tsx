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
import ImageWithFallback from '../common/ImageWithFallback';
import Button from '../common/Button';
import type { ProfilePageMyListingsQuery } from '../../__generated__/ProfilePageMyListingsQuery.graphql';
import styles from './ProfilePage.module.css';

const MyListingsQuery = graphql`
  query ProfilePageMyListingsQuery {
    myListings {
      id
      ...ListingCard_listing
      ...SellerListingCard_listing
    }
    myInquiries(type: SENT) {
      inquiries {
        id
        status
        listing {
          id
          title
          price
          images
          city
          state
        }
        seller {
          id
          name
          avatarUrl
        }
        contactPhone
        createdAt
        respondedAt
      }
      totalCount
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
  const myInquiries = data.myInquiries?.inquiries || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) {
      return 'just now';
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatPhoneForDisplay = (phone: string) => {
    // Remove all non-digits
    const phoneNumber = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length === 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    } else if (phoneNumber.length > 10) {
      // Handle international format with country code
      return `+${phoneNumber.slice(0, phoneNumber.length - 10)} (${phoneNumber.slice(-10, -7)}) ${phoneNumber.slice(-7, -4)}-${phoneNumber.slice(-4)}`;
    }
    // Return as-is if not a standard length
    return phone;
  };

  return (
    <>
      <div className={styles.section}>
        {myListings.length > 0 ? (
          <>
            <h2 className={styles.sectionTitle}>My Listings</h2>
            <div className={styles.sellerListingsContainer}>
              {myListings.map((listing) => (
                <SellerListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyMessage}>You haven't created any listings yet</p>
            <Button
              onClick={onCreateClick}
              variant="primary"
            >
              Create Listing
            </Button>
          </div>
        )}
      </div>

      {myInquiries.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>My Inquiries</h2>
          
          {/* Pending Inquiries */}
          {myInquiries.filter(inq => inq.status === 'PENDING').length > 0 && (
            <>
              <h3 className={styles.subsectionTitle}>Pending</h3>
              <div className={styles.inquiriesContainer}>
                {myInquiries.filter(inq => inq.status === 'PENDING').map((inquiry) => (
              <div key={inquiry.id} className={styles.inquiryCard} onClick={() => navigate(`/listing/${inquiry.listing.id}`)}>
                <div className={styles.imageSection}>
                  {inquiry.listing.images && inquiry.listing.images.length > 0 ? (
                    <ImageWithFallback
                      src={inquiry.listing.images[0]}
                      alt={inquiry.listing.title}
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
                
                <div className={styles.contentSection}>
                  <h3 className={styles.title}>{inquiry.listing.title}</h3>
                  <p className={styles.price}>{formatPrice(inquiry.listing.price)}</p>
                  
                  <div className={styles.meta}>
                    <div className={styles.location}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <span>{inquiry.listing.city}, {inquiry.listing.state}</span>
                    </div>
                    
                    <div className={styles.contactBox}>
                      {inquiry.status === 'PENDING' ? (
                        <span className={styles.offerPending}>Sent {formatDate(inquiry.createdAt)}</span>
                      ) : inquiry.status === 'REJECTED' ? (
                        <span className={styles.offerRejected}>Offer rejected</span>
                      ) : inquiry.status === 'ACCEPTED' && inquiry.contactPhone ? (
                        <div className={styles.contactInfo}>
                          <span className={styles.contactPhone}>
                            {formatPhoneForDisplay(inquiry.contactPhone)}
                          </span>
                        </div>
                      ) : (
                        <span className={styles.offerAccepted}>Contact shared</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
              </div>
            </>
          )}
          
          {/* Accepted Inquiries */}
          {myInquiries.filter(inq => inq.status === 'ACCEPTED').length > 0 && (
            <>
              <h3 className={styles.subsectionTitle}>Accepted</h3>
              <div className={styles.inquiriesContainer}>
                {myInquiries.filter(inq => inq.status === 'ACCEPTED').map((inquiry) => (
                  <div key={inquiry.id} className={styles.inquiryCard} onClick={() => navigate(`/listing/${inquiry.listing.id}`)}>
                    <div className={styles.imageSection}>
                      {inquiry.listing.images && inquiry.listing.images.length > 0 ? (
                        <ImageWithFallback
                          src={inquiry.listing.images[0]}
                          alt={inquiry.listing.title}
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
                    
                    <div className={styles.contentSection}>
                      <h3 className={styles.title}>{inquiry.listing.title}</h3>
                      <p className={styles.price}>{formatPrice(inquiry.listing.price)}</p>
                      
                      <div className={styles.meta}>
                        <div className={styles.location}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          <span>{inquiry.listing.city}, {inquiry.listing.state}</span>
                        </div>
                        
                        <div className={styles.contactBox}>
                          {inquiry.contactPhone ? (
                            <div className={styles.contactInfo}>
                              <span className={styles.contactPhone}>
                                {formatPhoneForDisplay(inquiry.contactPhone)}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
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