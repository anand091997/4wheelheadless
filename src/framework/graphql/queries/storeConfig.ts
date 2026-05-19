import { gql } from "@apollo/client";
import { createApolloClient } from "../apolloClient";

export const STORE_CONFIG_QUERY = gql`
  query StoreConfig {
    storeConfig {
      secure_base_media_url
      header_logo_src
      logo_alt
      logo_width
      logo_height
      copyright
      store_name
      default_title
      default_description
      default_keywords
    }
  }
`;

export type StoreConfig = {
  secure_base_media_url?: string | null;
  header_logo_src?: string | null;
  logo_alt?: string | null;
  logo_width?: number | null;
  logo_height?: number | null;
  copyright?: string | null;
  store_name?: string | null;
  default_title?: string | null;
  default_description?: string | null;
  default_keywords?: string | null;
};

type StoreConfigQueryResult = {
  storeConfig?: StoreConfig | null;
};

export async function getStoreConfig() {
  const client = createApolloClient();

  const { data } = await client.query<StoreConfigQueryResult>({
    query: STORE_CONFIG_QUERY,
  });

  return data?.storeConfig ?? null;
}
