import { graphql } from 'relay-runtime';

export const GetListingsQuery = graphql`
  query listingsQuery($category: CategoryType, $limit: Int, $offset: Int) {
    listings(category: $category, limit: $limit, offset: $offset) {
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
  query listingsSearchQuery($query: String!, $category: CategoryType, $limit: Int, $offset: Int, $filters: SearchFilters) {
    searchListings(query: $query, category: $category, limit: $limit, offset: $offset, filters: $filters) {
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
    category
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
    specifications {
      ... on BoatSpecifications {
        length
        year
        make
        model
        hullMaterial
        engineType
        horsepower
      }
      ... on PlaneSpecifications {
        year
        make
        model
        hours
        engineType
        seats
      }
      ... on BikeSpecifications {
        year
        make
        model
        engineSize
        mileage
      }
      ... on CarSpecifications {
        year
        make
        model
        mileage
        transmission
        fuelType
      }
    }
    createdAt
    updatedAt
  }
`;