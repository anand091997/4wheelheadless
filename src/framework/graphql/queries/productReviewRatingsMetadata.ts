import { gql } from "@apollo/client";
import { getBrowserApolloClient } from "../apolloClient";

export const PRODUCT_REVIEW_RATINGS_METADATA_QUERY = gql`
  query ProductReviewRatingsMetadata {
    productReviewRatingsMetadata {
      items {
        id
        name
        values {
          value_id
          value
        }
      }
    }
  }
`;

export type ProductReviewRatingValue = {
  value_id: string;
  value: string;
};

export type ProductReviewRatingMetaItem = {
  id: string;
  name: string;
  values: ProductReviewRatingValue[];
};

export type ProductReviewRatingsMetadataResult = {
  productReviewRatingsMetadata?: {
    items?: ProductReviewRatingMetaItem[] | null;
  } | null;
};

export async function fetchProductReviewRatingsMetadata() {
  const client = getBrowserApolloClient();
  const { data } = await client.query<ProductReviewRatingsMetadataResult>({
    query: PRODUCT_REVIEW_RATINGS_METADATA_QUERY,
  });
  return data?.productReviewRatingsMetadata?.items ?? [];
}
