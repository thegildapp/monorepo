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
    inquiries {
      id
      status
      buyer {
        id
        name
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
  
  const [expandedInquiry, setExpandedInquiry] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState(true);
  const [sharePhone, setSharePhone] = useState(false);
  
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
  
  // Engagement metrics (mock data for now)
  const engagementData = {
    views: 156,
    saves: 12,
    shares: 3,
    inquiries: listing.inquiries?.length || 0,
    viewsToday: 23,
    viewsThisWeek: 89,
    conversionRate: 1.3
  };
  
  const handleRespondToInquiry = (inquiryId: string, accept: boolean) => {
    commitRespond({
      variables: {
        inquiryId,
        accept,
        shareEmail: accept ? shareEmail : false,
        sharePhone: accept ? sharePhone : false
      },
      onCompleted: (response) => {
        if (response.respondToInquiry.errors && response.respondToInquiry.errors.length > 0) {
          alert(response.respondToInquiry.errors[0].message);
        } else {
          setExpandedInquiry(null);
          setShareEmail(true);
          setSharePhone(false);
        }
      },
      onError: (error) => {
        alert('Failed to respond to inquiry: ' + error.message);
      }
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
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
        
        {/* Inquiries Section */}
        <div className={styles.inquiriesSection}>
          <h2 className={styles.sectionTitle}>Inquiries</h2>
          
          {pendingInquiries.length === 0 && acceptedInquiries.length === 0 && rejectedInquiries.length === 0 ? (
            <div className={styles.noInquiries}>
              <p>No inquiries yet</p>
              <p className={styles.noInquiriesSubtext}>When buyers contact you, their requests will appear here</p>
            </div>
          ) : (
            <>
              {/* Pending Inquiries */}
              {pendingInquiries.length > 0 && (
                <div className={styles.inquiryGroup}>
                  <h3 className={styles.inquiryGroupTitle}>Pending</h3>
                  <div className={styles.inquiryList}>
                    {pendingInquiries.map((inquiry) => (
                      <div key={inquiry.id} className={`${styles.inquiryCard} ${expandedInquiry === inquiry.id ? styles.expanded : ''}`}>
                        <div className={styles.inquiryMain} onClick={() => setExpandedInquiry(expandedInquiry === inquiry.id ? null : inquiry.id)}>
                          <div className={styles.buyerInfo}>
                            <span className={styles.buyerName}>{inquiry.buyer.name || 'Unknown'}</span>
                            <span className={styles.separator}>•</span>
                            <span className={styles.inquiryDate}>{formatDate(inquiry.createdAt)}</span>
                          </div>
                          <div className={styles.expandIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points={expandedInquiry === inquiry.id ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}></polyline>
                            </svg>
                          </div>
                        </div>
                        
                        {expandedInquiry === inquiry.id && (
                          <div className={styles.inquiryActions}>
                            <div className={styles.shareOptions}>
                              <label className={styles.checkbox}>
                                <input
                                  type="checkbox"
                                  checked={shareEmail}
                                  onChange={(e) => setShareEmail(e.target.checked)}
                                />
                                <span>Share email</span>
                              </label>
                              <label className={styles.checkbox}>
                                <input
                                  type="checkbox"
                                  checked={sharePhone}
                                  onChange={(e) => setSharePhone(e.target.checked)}
                                />
                                <span>Share phone</span>
                              </label>
                            </div>
                            <div className={styles.actionButtons}>
                              <Button
                                variant="secondary"
                                onClick={() => handleRespondToInquiry(inquiry.id, false)}
                                disabled={isResponding}
                              >
                                Reject
                              </Button>
                              <Button
                                variant="primary"
                                onClick={() => handleRespondToInquiry(inquiry.id, true)}
                                disabled={isResponding || (!shareEmail && !sharePhone)}
                              >
                                Accept
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Accepted Inquiries */}
              {acceptedInquiries.length > 0 && (
                <div className={styles.inquiryGroup}>
                  <h3 className={styles.inquiryGroupTitle}>Accepted</h3>
                  <div className={styles.inquiryList}>
                    {acceptedInquiries.map((inquiry) => (
                      <div key={inquiry.id} className={styles.inquiryCard}>
                        <div className={styles.inquiryMain}>
                          <div className={styles.buyerInfo}>
                            <span className={styles.buyerName}>{inquiry.buyer.name || 'Unknown'}</span>
                            <span className={styles.separator}>•</span>
                            <span className={styles.inquiryDate}>{formatDate(inquiry.respondedAt || inquiry.createdAt)}</span>
                            <span className={styles.separator}>•</span>
                            <span className={styles.statusLabel}>Accepted</span>
                          </div>
                        </div>
                      </div>
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