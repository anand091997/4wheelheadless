/** Fields shared by PLP cards and PDP linked-product sliders. */
export const PRODUCT_LIST_ITEM_FIELDS = `
  uid
  id
  name
  sku
  url_key
  __typename
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
`;
