import { graphql } from 'relay-runtime';

export const RequestContactMutation = graphql`
  mutation inquiriesRequestContactMutation($listingId: ID!) {
    requestContact(listingId: $listingId) {
      inquiry {
        id
        status
        createdAt
      }
      errors {
        field
        message
      }
    }
  }
`;

export const InquiryFragment = graphql`
  fragment inquiriesInquiry_inquiry on Inquiry {
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
`;

export const MyInquiriesQuery = graphql`
  query inquiriesMyInquiriesQuery($type: InquiryType!, $status: InquiryStatus, $limit: Int, $offset: Int) {
    myInquiries(type: $type, status: $status, limit: $limit, offset: $offset) {
      inquiries {
        ...inquiriesInquiry_inquiry
      }
      totalCount
      hasMore
    }
  }
`;