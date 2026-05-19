import { gql } from "@apollo/client";
import { createApolloClient } from "../apolloClient";

export const CATEGORY_BY_URL_PATH_QUERY = gql`
  query CategoryByUrlPath($urlPath: String!) {
    categories(filters: { url_path: { eq: $urlPath } }) {
      items {
        id
        name
        url_path
        meta_title
        meta_description
        meta_keywords
      }
    }
  }
`;

type CategoryByUrlPathQueryResult = {
  categories?: {
    items?: Array<{
      id: string;
      name: string;
      url_path?: string | null;
      meta_title?: string | null;
      meta_description?: string | null;
      meta_keywords?: string | null;
    }>;
  } | null;
};

export async function getCategoryByUrlPath(urlPath: string) {
  const client = createApolloClient();

  const { data } = await client.query<CategoryByUrlPathQueryResult>({
    query: CATEGORY_BY_URL_PATH_QUERY,
    variables: { urlPath },
  });

  return data?.categories?.items?.[0] ?? null;
}
