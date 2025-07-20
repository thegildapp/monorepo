import { Suspense, useState } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import Header from '../layout/Header';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import ListingGrid from '../features/ListingGrid';
import LoadingGrid from '../features/LoadingGrid';
import LocationSelector from '../features/LocationSelector';
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
            <LocationSelector
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
        <LocationSelector
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