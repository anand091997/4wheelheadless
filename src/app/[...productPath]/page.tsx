import type { Metadata } from "next";
import ProductDetailPage from "@/components/pdp/ProductDetailPage";
import ProductListingPage from "@/components/plp/ProductListingPage";
import { getCategoryByUrlPath, getCmsPageByRoute, getProductByUrlKey } from "@/framework/graphql";
import { buildPageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

type CatchAllPageProps = {
  params: Promise<{
    productPath: string[];
  }>;
};

export async function generateMetadata({ params }: CatchAllPageProps): Promise<Metadata> {
  const { productPath } = await params;
  const joinedPath = `/${(productPath || []).join("/")}`;

  const cmsPage = await getCmsPageByRoute(joinedPath).catch(() => null);
  if (cmsPage?.type === "CMS_PAGE") {
    const metaTitle = cmsPage.meta_title?.trim();
    const title = metaTitle || cmsPage.title?.trim() || "Page";

    return buildPageMetadata({
      title,
      description: cmsPage.meta_description,
      keywords: cmsPage.meta_keywords,
      path: joinedPath,
      absoluteTitle: Boolean(metaTitle),
    });
  }

  const normalizedPath = joinedPath.replace(/^\/+/, "");
  const category = normalizedPath
    ? await getCategoryByUrlPath(normalizedPath).catch(() => null)
    : null;

  if (category?.id) {
    const metaTitle = category.meta_title?.trim();
    const title = metaTitle || category.name;
    const description =
      category.meta_description?.trim() ||
      `Shop ${category.name} products and accessories.`;

    return buildPageMetadata({
      title,
      description,
      keywords: category.meta_keywords,
      path: joinedPath,
      absoluteTitle: Boolean(metaTitle),
    });
  }

  const urlKey = (productPath || []).filter(Boolean).at(-1)?.trim();
  if (urlKey) {
    const product = await getProductByUrlKey(urlKey).catch(() => null);
    if (product?.name) {
      const metaTitle = product.meta_title?.trim();
      const title = metaTitle || product.name;
      const plainShort =
        product.short_description?.html
          ?.replace(/<[^>]+>/g, " ")
          .trim()
          .slice(0, 160) || "";
      const description =
        product.meta_description?.trim() ||
        (plainShort ? plainShort : `Buy ${product.name} online.`);

      return buildPageMetadata({
        title,
        description,
        keywords: product.meta_keyword,
        path: joinedPath,
        absoluteTitle: Boolean(metaTitle),
      });
    }
  }

  return {};
}

export default async function CatchAllProductPathPage({ params }: CatchAllPageProps) {
  const { productPath } = await params;
  const joinedPath = `/${(productPath || []).join("/")}`;

  const cmsPage = await getCmsPageByRoute(joinedPath);
  if (cmsPage?.type === "CMS_PAGE" && cmsPage.content) {
    return <main dangerouslySetInnerHTML={{ __html: cmsPage.content }} />;
  }

  const normalizedPath = joinedPath.replace(/^\/+/, "");
  const category = normalizedPath ? await getCategoryByUrlPath(normalizedPath) : null;
  if (category?.id) {
    return (
      <ProductListingPage initialCategoryId={category.id} initialCategoryName={category.name} />
    );
  }

  const urlKey = (productPath || []).filter(Boolean).at(-1)?.trim();
  if (urlKey) {
    const product = await getProductByUrlKey(urlKey).catch(() => null);
    if (product?.sku) {
      return <ProductDetailPage product={product} />;
    }
  }

  notFound();
}
