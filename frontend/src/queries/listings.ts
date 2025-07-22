import { graphql } from 'relay-runtime';

export const GetListingsQuery = graphql`
  query listingsQuery($limit: Int, $offset: Int, $filters: LocationFilter) {
    listings(limit: $limit, offset: $offset, filters: $filters) {
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
    imageVariants {
      thumbnail
      card
      full
    }
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

export const CreateListingMutation = graphql`
  mutation listingsCreateListingMutation($input: CreateListingInput!) {
    createListing(input: $input) {
      id
      title
      description
      price
      images
      imageVariants {
        thumbnail
        card
        full
      }
      city
      state
      status
      createdAt
      updatedAt
      seller {
        id
        name
        email
      }
    }
  }
`;

export const UpdateListingMutation = graphql`
  mutation listingsUpdateListingMutation($id: ID!, $input: UpdateListingInput!) {
    updateListing(id: $id, input: $input) {
      id
      title
      description
      price
      images
      imageVariants {
        thumbnail
        card
        full
      }
      city
      state
      status
      createdAt
      updatedAt
    }
  }
`;

export const GenerateUploadUrlMutation = graphql`
  mutation listingsGenerateUploadUrlMutation($filename: String!, $contentType: String!) {
    generateUploadUrl(filename: $filename, contentType: $contentType) {
      url
      key
    }
  }
`;