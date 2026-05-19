const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  imageDomain: process.env.NEXT_PUBLIC_IMAGE_DOMAIN,
  commerceBaseUrl: process.env.NEXT_PUBLIC_COMMERCE_BASE_URL,
  commerceStoreCode: process.env.NEXT_PUBLIC_COMMERCE_STORE_CODE,
  commerceApiKey: process.env.COMMERCE_API_KEY,
  graphqlEndpoint: "/api/graphql",
};

export default config;
