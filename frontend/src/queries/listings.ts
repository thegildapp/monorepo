import { graphql } from 'relay-runtime';

export const GetListingsQuery = graphql`
  query listingsQuery($limit: Int, $offset: Int) {
    listings(limit: $limit, offset: $offset) {
      ...ListingCard_listing
    }
  }
`;

export const GetListingQuery = graphql`
  query listingsGetListingQuery($id: ID!) {
    listing(id: $id) {
      ...ListingCard_listing
      ...listingsListingDetail_listing
    }
  }
`;

export const SearchListingsQuery = graphql`
  query listingsSearchQuery($query: String!, $limit: Int, $offset: Int, $filters: SearchFilters) {
    searchListings(query: $query, limit: $limit, offset: $offset, filters: $filters) {
      ...ListingCard_listing
    }
  }
`;

export const ListingDetailFragment = graphql`
  fragment listingsListingDetail_listing on Listing {
    id
    title
    description
    price
    images
    city
    state
    seller {
      id
      name
      email
      phone
      avatarUrl
    }
    createdAt
    updatedAt
  }
`;