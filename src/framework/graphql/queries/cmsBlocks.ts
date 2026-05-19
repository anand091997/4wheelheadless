import { gql } from "@apollo/client";
import { createApolloClient } from "../apolloClient";

export const CMS_BLOCK_BY_IDENTIFIER_QUERY = gql`
  query CmsBlockByIdentifier($identifiers: [String]) {
    cmsBlocks(identifiers: $identifiers) {
      items {
        identifier
        title
        content
      }
    }
  }
`;

export const CMS_PAGE_BY_ROUTE_QUERY = gql`
  query CmsPageByRoute($url: String!) {
    route(url: $url) {
      relative_url
      type
      ... on CmsPage {
        identifier
        title
        content
        meta_title
        meta_description
        meta_keywords
      }
    }
  }
`;

type CmsBlockItem = {
  identifier: string;
  title: string;
  content: string;
};

type CmsBlockQueryResult = {
  cmsBlocks: {
    items: CmsBlockItem[];
  };
};

type CmsPageRoute = {
  relative_url?: string | null;
  type?: string | null;
  identifier?: string | null;
  title?: string | null;
  content?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
};

type CmsPageByRouteQueryResult = {
  route?: CmsPageRoute | null;
};

export async function getCmsBlockByIdentifier(identifier: string) {
  const client = createApolloClient();

  const { data } = await client.query<CmsBlockQueryResult>({
    query: CMS_BLOCK_BY_IDENTIFIER_QUERY,
    variables: {
      identifiers: [identifier],
    },
  });

  return data?.cmsBlocks.items[0] ?? null;
}

export async function getCmsPageByRoute(url: string) {
  const client = createApolloClient();

  const { data } = await client.query<CmsPageByRouteQueryResult>({
    query: CMS_PAGE_BY_ROUTE_QUERY,
    variables: { url },
  });

  return data?.route ?? null;
}
