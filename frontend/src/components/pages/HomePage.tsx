import { Suspense } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import Header from '../layout/Header';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import ListingGrid from '../features/ListingGrid';
import LoadingGrid from '../features/LoadingGrid';
import { GetListingsQuery } from '../../queries/listings';
import type { listingsQuery } from '../../__generated__/listingsQuery.graphql';

export default function HomePage() {
  const data = useLazyLoadQuery<listingsQuery>(
    GetListingsQuery,
    { limit: 20, offset: 0 },
    { fetchPolicy: 'store-and-network' }
  );

  return (
    <Layout>
      <Header 
        logoText="Gild" 
      />
      <Main>
        <Suspense fallback={<LoadingGrid />}>
          <ListingGrid listings={data.listings} />
        </Suspense>
      </Main>
    </Layout>
  );
}