import { gql } from "@apollo/client";

export const LISTING_PRICE_RANGE = gql`
  query GetUserMomentListingsDedicated($input: GetUserMomentListingsInput!) {
    getUserMomentListings(input: $input) {
      data {
        circulationCount
        priceRange {
          min
          max
        }
        momentListingCount
      }
    }
  }
`;

export const MOMENT_LISTING_QUERY = gql`
  query GetUserMomentListingsDedicated($input: GetUserMomentListingsInput!) {
    getUserMomentListings(input: $input) {
      data {
        circulationCount
        priceRange {
          min
          max
        }
        momentListings {
          id
          moment {
            id
            price
            flowSerialNumber
            owner {
              dapperID
              username
              profileImageUrl
            }
          }
        }
        momentListingCount
      }
    }
  }
`;

export const MINTED_MOMENT_QUERY = gql`
  query GetMintedMoment($momentId: ID!) {
    getMintedMoment(momentId: $momentId) {
      data {
        ...MomentDetails
      }
    }
  }

  fragment MomentDetails on MintedMoment {
    id
    version
    sortID
    set {
      id
      flowName
      flowSeriesNumber
      setVisualId
    }
    setPlay {
      ID
      flowRetired
      circulationCount
    }
    assetPathPrefix
    price
    listingOrderID
    flowId
    owner {
      dapperID
      username
      profileImageUrl
      __typename
    }
    flowSerialNumber
    forSale
  }
`;
