import ListingCard from './ListingCard';
import LoadingState from '../feedback/LoadingState';
import ErrorState from '../feedback/ErrorState';
import type { ListingCard_listing$key } from '../../__generated__/ListingCard_listing.graphql'
import styles from './ListingGrid.module.css'

interface ListingGridProps {
  listings: ReadonlyArray<ListingCard_listing$key>;
  loading?: boolean;
  error?: string | null;
}

const ListingGrid: React.FC<ListingGridProps> = ({ listings, loading = false, error = null }) => {
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className={styles.listingGridContainer}>
      <div className={styles.listingGrid}>
        {listings?.map((listing, index) => (
          <ListingCard key={index} listing={listing} />
        )) || []}
      </div>
    </div>
  )
}

export default ListingGrid