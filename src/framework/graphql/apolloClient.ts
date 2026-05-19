import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import config from "@/config/config";

function buildGraphqlHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (config.commerceStoreCode) {
    headers.Store = config.commerceStoreCode;
  }

  if (config.commerceApiKey) {
    headers["X-Api-Key"] = config.commerceApiKey;
  }

  return headers;
}

function createGraphqlFetch(): typeof fetch {
  const useInsecureTls = process.env.COMMERCE_GRAPHQL_TLS_INSECURE === "true";

  return (input, init) => {
    if (useInsecureTls && typeof window === "undefined") {
      // DDEV/local SSL can be self-signed; server-side Magento calls only.
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
    return fetch(input, init);
  };
}

export function createApolloClient() {
  const uri = String(config.commerceBaseUrl ?? "").trim();

  if (!uri) {
    throw new Error("Magento GraphQL endpoint is not configured");
  }

  return new ApolloClient({
    link: new HttpLink({
      uri,
      headers: buildGraphqlHeaders(),
      fetch: createGraphqlFetch(),
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: "no-cache",
      },
    },
  });
}

let browserApolloClient: ApolloClient | null = null;

export function getBrowserApolloClient() {
  if (typeof window === "undefined") {
    return createApolloClient();
  }

  if (!browserApolloClient) {
    browserApolloClient = new ApolloClient({
      link: new HttpLink({
        uri: config.graphqlEndpoint,
        headers: buildGraphqlHeaders(),
        fetch: createGraphqlFetch(),
      }),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: "no-cache",
        },
      },
    });
  }

  return browserApolloClient;
}
