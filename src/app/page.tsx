import type { Metadata } from "next";
import { getCmsPageByRoute, getStoreConfig } from "@/framework/graphql";
import { buildPageMetadata, DEFAULT_SITE_NAME } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [pageData, storeConfig] = await Promise.all([
    getCmsPageByRoute("/").catch(() => null),
    getStoreConfig().catch(() => null),
  ]);

  const metaTitle = pageData?.meta_title?.trim();
  const pageTitle = pageData?.title?.trim();
  const storeTitle = storeConfig?.default_title?.trim();
  const storeName = storeConfig?.store_name?.trim();

  const title =
    metaTitle ||
    pageTitle ||
    storeTitle ||
    storeName ||
    DEFAULT_SITE_NAME;

  const description =
    pageData?.meta_description?.trim() ||
    storeConfig?.default_description?.trim() ||
    undefined;

  const keywords =
    pageData?.meta_keywords?.trim() ||
    storeConfig?.default_keywords?.trim() ||
    undefined;

  return buildPageMetadata({
    title,
    description,
    keywords,
    path: "/",
    absoluteTitle: Boolean(metaTitle || storeTitle),
  });
}

export default async function Home() {
  const pageData = await getCmsPageByRoute("/");

  return (
    <main>
      {pageData?.content ? (
        <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
      ) : null}
    </main>
  );
}
