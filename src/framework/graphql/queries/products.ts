import { gql } from "@apollo/client";

export const PRODUCTS_QUERY = gql`
  query Products(
    $filters: ProductAttributeFilterInput!
    $pageSize: Int!
    $currentPage: Int!
    $sort: ProductAttributeSortInput
  ) {
    products(
      filter: $filters
      pageSize: $pageSize
      currentPage: $currentPage
      sort: $sort
    ) {
      total_count
      aggregations {
        attribute_code
        label
        options {
          label
          value
          count
        }
      }
      items {
        uid
        id
        name
        sku
        url_key
        __typename
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
        small_image {
          url
          label
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
      page_info {
        current_page
        page_size
        total_pages
      }
    }
  }
`;

export type ProductAggregationOption = {
  label: string;
  value: string;
  count: number;
};

export type ProductAggregation = {
  attribute_code: string;
  label: string;
  options: ProductAggregationOption[];
};

export type SwatchData = {
  __typename?: string;
  value?: string | null;
  thumbnail?: string | null;
};

export type ConfigurableOptionValue = {
  uid: string;
  label: string;
  value_index: number;
  swatch_data?: SwatchData | null;
};

export type ConfigurableOption = {
  uid: string;
  attribute_code?: string | null;
  label: string;
  values?: ConfigurableOptionValue[] | null;
};

export type ConfigurableVariant = {
  product?: {
    uid: string;
    sku: string;
    small_image?: {
      url?: string | null;
      label?: string | null;
    } | null;
  } | null;
  attributes?: Array<{
    code: string;
    value_index: number;
  }> | null;
};

export type ProductItem = {
  uid: string;
  id: number;
  name: string;
  sku: string;
  url_key?: string | null;
  __typename?: string;
  configurable_options?: ConfigurableOption[] | null;
  variants?: ConfigurableVariant[] | null;
  small_image?: {
    url?: string | null;
    label?: string | null;
  } | null;
  price_range?: {
    minimum_price?: {
      regular_price?: {
        value: number;
        currency: string;
      } | null;
      final_price?: {
        value: number;
        currency: string;
      } | null;
      discount?: {
        percent_off: number;
      } | null;
    } | null;
  } | null;
  /** Present on PDP / detail queries when requested */
  rating_summary?: number | null;
  review_count?: number | null;
  only_x_left_in_stock?: number | null;
  stock_status?: string | null;
};

export type ProductsQueryResult = {
  products?: {
    total_count: number;
    aggregations?: ProductAggregation[] | null;
    items?: ProductItem[] | null;
    page_info?: {
      current_page: number;
      page_size: number;
      total_pages: number;
    } | null;
  } | null;
};
