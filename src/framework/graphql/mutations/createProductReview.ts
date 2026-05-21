import { gql } from "@apollo/client";
import { getBrowserApolloClient } from "../apolloClient";

export const CREATE_PRODUCT_REVIEW_MUTATION = gql`
  mutation CreateProductReview($input: CreateProductReviewInput!) {
    createProductReview(input: $input) {
      review {
        nickname
        summary
        text
        average_rating
        ratings_breakdown {
          name
          value
        }
      }
    }
  }
`;

export type CreateProductReviewRatingInput = {
  id: string;
  value_id: string;
};

export type CreateProductReviewInput = {
  sku: string;
  nickname: string;
  summary: string;
  text: string;
  ratings: CreateProductReviewRatingInput[];
};

type CreateProductReviewResult = {
  createProductReview?: {
    review?: {
      nickname?: string | null;
      summary?: string | null;
      text?: string | null;
      average_rating?: number | null;
      ratings_breakdown?: Array<{ name?: string | null; value?: string | null }> | null;
    } | null;
  } | null;
};

export async function createProductReviewRequest(input: CreateProductReviewInput) {
  const client = getBrowserApolloClient();
  const { data } = await client.mutate<CreateProductReviewResult>({
    mutation: CREATE_PRODUCT_REVIEW_MUTATION,
    variables: { input },
  });
  const review = data?.createProductReview?.review;
  if (!review) {
    throw new Error("Review could not be created. Check permissions or try signing in.");
  }
  return review;
}
