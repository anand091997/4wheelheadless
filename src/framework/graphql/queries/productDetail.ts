import { gql } from "@apollo/client";
import { createApolloClient } from "../apolloClient";
import type { ProductItem } from "./products";

export const PRODUCT_DETAIL_QUERY = gql`
  query ProductDetail($urlKey: String!) {
    products(filter: { url_key: { eq: $urlKey } }, pageSize: 1, currentPage: 1) {
      items {
        uid
        id
        name
        sku
        url_key
        __typename
        meta_title
        meta_description
        meta_keyword
        short_description {
          html
        }
        description {
          html
        }
        image {
          url
          label
        }
        small_image {
          url
          label
        }
        thumbnail {
          url
          label
        }
        media_gallery {
          url
          label
          position
        }
        rating_summary
        review_count
        only_x_left_in_stock
        stock_status
        reviews(pageSize: 50, currentPage: 1) {
          items {
            nickname
            summary
            text
            average_rating
            created_at
            ratings_breakdown {
              name
              value
            }
          }
          page_info {
            current_page
            page_size
            total_pages
          }
        }
        ... on ConfigurableProduct {
          configurable_options {
            uid
            attribute_code
            label
            values {
              uid
              label
              value_index
              swatch_data {
                __typename
                ... on ColorSwatchData {
                  value
                }
                ... on ImageSwatchData {
                  value
                  thumbnail
                }
                ... on TextSwatchData {
                  value
                }
              }
            }
          }
          variants {
            product {
              uid
              sku
              small_image {
                url
                label
              }
            }
            attributes {
              code
              value_index
            }
          }
        }
        price_range {
          minimum_price {
            regular_price {
              value
              currency
            }
            final_price {
              value
              currency
            }
            discount {
              percent_off
            }
          }
        }
      }
    }
  }
`;

export type HtmlContent = {
  html?: string | null;
};

export type MediaGalleryEntry = {
  url?: string | null;
  label?: string | null;
  position?: number | null;
};

export type ProductReviewItem = {
  nickname?: string | null;
  summary?: string | null;
  text?: string | null;
  average_rating?: number | null;
  created_at?: string | null;
  ratings_breakdown?: Array<{ name?: string | null; value?: string | null }> | null;
};

export type ProductReviewsConnection = {
  items?: ProductReviewItem[] | null;
  page_info?: {
    current_page?: number | null;
    page_size?: number | null;
    total_pages?: number | null;
  } | null;
};

export type ProductDetailItem = ProductItem & {
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keyword?: string | null;
  short_description?: HtmlContent | null;
  description?: HtmlContent | null;
  image?: {
    url?: string | null;
    label?: string | null;
  } | null;
  thumbnail?: {
    url?: string | null;
    label?: string | null;
  } | null;
  media_gallery?: MediaGalleryEntry[] | null;
  reviews?: ProductReviewsConnection | null;
};

export type ProductDetailQueryResult = {
  products?: {
    items?: ProductDetailItem[] | null;
  } | null;
};

export async function getProductByUrlKey(urlKey: string) {
  const trimmed = urlKey.trim();
  if (!trimmed) {
    return null;
  }

  const client = createApolloClient();

  const { data } = await client.query<ProductDetailQueryResult>({
    query: PRODUCT_DETAIL_QUERY,
    variables: { urlKey: trimmed },
  });

  return data?.products?.items?.[0] ?? null;
}
