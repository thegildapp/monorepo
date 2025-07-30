import { graphql } from 'relay-runtime';

export const TrackListingViewMutation = graphql`
  mutation viewTrackingTrackListingViewMutation($listingId: ID!) {
    trackListingView(listingId: $listingId) {
      success
      viewCount
    }
  }
`;