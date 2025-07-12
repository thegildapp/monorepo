import ListingCard from './ListingCard';
import LoadingState from '../feedback/LoadingState';
import ErrorState from '../feedback/ErrorState';
import { CategoryType } from '../../types';
import type { ListingCard_listing$key } from '../../__generated__/ListingCard_listing.graphql'
import styles from './ListingGrid.module.css'

interface ListingGridProps {
  listings: ReadonlyArray<ListingCard_listing$key>;
  category?: CategoryType;
  loading?: boolean;
  error?: string | null;
}

const ListingGrid: React.FC<ListingGridProps> = ({ listings, category, loading = false, error = null }) => {
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
          <ListingCard key={index} listing={listing} category={category} />
        )) || []}
      </div>
    </div>
  )
}

export default ListingGrid