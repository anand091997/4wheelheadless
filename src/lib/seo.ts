import type { Metadata } from "next";

export const FAVICON_PATH = "/assets/images/4WP_Favocon_144x144.png";
export const DEFAULT_SITE_NAME = "4Wheel Parts";

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
}

export function getMetadataBase(): URL | undefined {
  const siteUrl = getSiteUrl();
  if (!siteUrl) {
    return undefined;
  }

  try {
    return new URL(siteUrl);
  } catch {
    return undefined;
  }
}

export function buildCanonicalUrl(path: string): string | undefined {
  const siteUrl = getSiteUrl();
  if (!siteUrl) {
    return undefined;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

type BuildPageMetadataInput = {
  title: string;
  description?: string | null;
  keywords?: string | null;
  path?: string;
  /** Use when Magento meta_title is already a full title string. */
  absoluteTitle?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  keywords,
  path = "",
  absoluteTitle = false,
}: BuildPageMetadataInput): Metadata {
  const trimmedTitle = title.trim() || DEFAULT_SITE_NAME;
  const trimmedDescription = description?.trim() || undefined;
  const keywordList = keywords
    ?.split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  const canonical = path ? buildCanonicalUrl(path) : undefined;

  const pageTitle = absoluteTitle ? { absolute: trimmedTitle } : trimmedTitle;

  return {
    title: pageTitle,
    description: trimmedDescription,
    keywords: keywordList?.length ? keywordList : undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: trimmedTitle,
      description: trimmedDescription,
      url: canonical,
      siteName: DEFAULT_SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: trimmedTitle,
      description: trimmedDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function createRootMetadata(overrides?: Partial<Metadata>): Metadata {
  return {
    metadataBase: getMetadataBase(),
    title: {
      default: DEFAULT_SITE_NAME,
      template: `%s | ${DEFAULT_SITE_NAME}`,
    },
    description: "Shop automotive parts and accessories at 4Wheel Parts.",
    icons: {
      icon: [{ url: FAVICON_PATH, sizes: "144x144", type: "image/png" }],
      shortcut: [FAVICON_PATH],
      apple: [{ url: FAVICON_PATH, sizes: "144x144", type: "image/png" }],
    },
    openGraph: {
      siteName: DEFAULT_SITE_NAME,
      type: "website",
    },
    ...overrides,
  };
}
