import { gql } from "@apollo/client";
import { createApolloClient } from "../apolloClient";

export const HEADER_MENU_CATEGORIES_QUERY = gql`
  query HeaderMenuCategories {
    categories(filters: { parent_id: { eq: "2" } }) {
      items {
        id
        name
        url_path
        children {
          id
          name
          url_path
          children {
            id
            name
            url_path
          }
        }
      }
    }
  }
`;

export type HeaderCategory = {
  id: string;
  name: string;
  url_path?: string | null;
  children?: HeaderCategory[];
};

type HeaderCategoriesQueryResult = {
  categories?: {
    items?: HeaderCategory[];
  } | null;
};

export async function getHeaderMenuCategories() {
  const client = createApolloClient();

  const { data } = await client.query<HeaderCategoriesQueryResult>({
    query: HEADER_MENU_CATEGORIES_QUERY,
  });

  return data?.categories?.items ?? [];
}
