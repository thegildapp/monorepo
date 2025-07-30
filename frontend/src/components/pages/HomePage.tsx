import { Suspense, useState } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import Header from '../layout/Header';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import ListingGrid from '../features/ListingGrid';
import LoadingGrid from '../features/LoadingGrid';
import LocationSelectorInline from '../features/LocationSelectorInline';
import { useScrollVisibility } from '../../contexts/ScrollVisibilityContext';
import { GetListingsQuery } from '../../queries/listings';
import type { listingsQuery } from '../../__generated__/listingsQuery.graphql';
import styles from './HomePage.module.css';

interface HomePageContentProps {
  location: {lat: number; lng: number; city?: string; state?: string} | null;
  radius: number;
}

function HomePageContent({ location, radius }: HomePageContentProps) {
  const data = useLazyLoadQuery<listingsQuery>(
    GetListingsQuery,
    { 
      limit: 20, 
      offset: 0,
      filters: location ? {
        latitude: location.lat,
        longitude: location.lng,
        radius: radius
      } : null
    },
    { fetchPolicy: 'store-and-network' }
  );

  if (!location) {
    return (
      <div className={styles.noLocationState}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className={styles.locationIcon}>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
        </svg>
        <h2 className={styles.noLocationTitle}>Select a location</h2>
        <p className={styles.noLocationText}>Choose a location above to see listings in your area</p>
      </div>
    );
  }

  return <ListingGrid listings={data.listings} />;
}

export default function HomePage() {
  const [location, setLocation] = useState<{lat: number; lng: number; city?: string; state?: string} | null>(null);
  const [radius, setRadius] = useState(20);
  const { isHeaderVisible, isMobile } = useScrollVisibility();

  return (
    <Layout>
      <Header 
        logoText="Gild"
        extraContent={
          <div className={styles.headerLocationSelector}>
            <LocationSelectorInline
              onLocationChange={(loc, rad) => {
                setLocation(loc);
                setRadius(rad);
              }}
            />
          </div>
        }
      />
      {/* Mobile location bar */}
      <div className={`${styles.mobileLocationBar} ${!isHeaderVisible && isMobile ? styles.mobileLocationBarHidden : ''}`}>
        <LocationSelectorInline
          onLocationChange={(loc, rad) => {
            setLocation(loc);
            setRadius(rad);
          }}
        />
      </div>
      <Main>
        <Suspense fallback={<LoadingGrid />}>
          <HomePageContent location={location} radius={radius} />
        </Suspense>
      </Main>
    </Layout>
  );
}