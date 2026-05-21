"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getBrowserApolloClient } from "@/framework/graphql/apolloClient";
import {
  PRODUCT_DETAIL_QUERY,
  type ProductDetailItem,
  type ProductDetailQueryResult,
  type ProductReviewItem,
} from "@/framework/graphql/queries/productDetail";
import { StarIcon } from "@/components/Icon";
import WriteReviewDrawer from "@/components/pdp/WriteReviewDrawer";

function formatReviewDate(raw: string | null | undefined): string {
  if (!raw?.trim()) {
    return "";
  }
  const trimmed = raw.trim();
  const asNum = Number.parseInt(trimmed, 10);
  const date =
    /^\d{9,}$/.test(trimmed) || /^\d{10}$/.test(trimmed)
      ? new Date(asNum * (trimmed.length <= 10 ? 1000 : 1))
      : new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Avoid SSR/client locale or timezone mismatches for review dates. */
function ReviewDate({ raw }: { raw: string | null | undefined }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const formatted = formatReviewDate(raw);
    setLabel(formatted || null);
  }, [raw]);

  if (!label) {
    return null;
  }

  return <p className="text-xs text-gray-500">{label}</p>;
}

function averageToStarsOutOf5(average: number | null | undefined): number {
  if (typeof average !== "number" || Number.isNaN(average)) {
    return 0;
  }
  return average > 5 ? average / 20 : average;
}

function ReviewStarsRow({ value }: { value: number }) {
  const stars = Math.min(5, Math.max(0, averageToStarsOutOf5(value)));
  const rounded = Math.round(stars);
  const title = `${rounded} ${rounded === 1 ? "star" : "stars"}`;

  return (
    <div className="flex" title={title} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon
          key={i}
          size={24}
          className={`h-6 w-6 shrink-0 ${i <= rounded ? "text-[#FAE703]" : "text-gray-400"}`}
        />
      ))}
    </div>
  );
}

/** Count reviews into 1–5 buckets from each review’s average_rating (Magento often uses 0–100). */
function starHistogramCounts(items: ProductReviewItem[]): number[] {
  const counts = [0, 0, 0, 0, 0];
  for (const review of items) {
    const rounded = Math.round(averageToStarsOutOf5(review.average_rating ?? 0));
    if (rounded >= 1 && rounded <= 5) {
      counts[rounded - 1] += 1;
    }
  }
  return counts;
}

type ProductReviewsSectionProps = {
  product: ProductDetailItem;
};

export default function ProductReviewsSection({ product }: ProductReviewsSectionProps) {
  const urlKey = product.url_key?.trim() ?? "";
  const initialItems = useMemo(
    () => product.reviews?.items?.filter(Boolean) ?? [],
    [product.reviews?.items],
  );

  const [reviews, setReviews] = useState<ProductReviewItem[]>(initialItems);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setReviews(initialItems);
  }, [initialItems]);

  const refetchReviews = useCallback(async () => {
    if (!urlKey) {
      return;
    }
    const client = getBrowserApolloClient();
    const { data } = await client.query<ProductDetailQueryResult>({
      query: PRODUCT_DETAIL_QUERY,
      variables: { urlKey },
    });
    const next = data?.products?.items?.[0]?.reviews?.items?.filter(Boolean) as
      | ProductReviewItem[]
      | undefined;
    setReviews(next ?? []);
  }, [urlKey]);

  const pageInfo = product.reviews?.page_info;
  const showPaginationNote =
    pageInfo && typeof pageInfo.total_pages === "number" && pageInfo.total_pages > 1;

  const storeReviewCount = product.review_count ?? 0;
  const ratingSummaryPct = product.rating_summary ?? 0;
  const avgFromStore = ratingSummaryPct / 20;
  const histogram = useMemo(() => starHistogramCounts(reviews), [reviews]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-[9rem] flex-wrap items-start justify-between gap-3 bg-[#f2f7fd] p-3 lg:gap-5 lg:p-5 xl:flex-nowrap">
        <div className="flex gap-x-4 w-full xl:w-auto">
          <div className="flex w-32 shrink-0 flex-col">
            <p className="text-3xl tabular-nums text-gray-900 lg:text-4xl xl:text-6xl">
              {storeReviewCount === 0 ? "0" : avgFromStore.toFixed(1)}
            </p>
            <div className="mt-auto">
              <div className="mb-1">
                <ReviewStarsRow value={ratingSummaryPct} />
              </div>
              <p className="text-xs text-gray-800">
                Based on {storeReviewCount} {storeReviewCount === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>

          <div className="h-fit min-w-0 w-full align-middle lg:order-none">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = histogram[stars - 1] ?? 0;
              const valuePct =
                storeReviewCount > 0 ? Math.round((count / storeReviewCount) * 100) : 0;
              const barId = `review-bar-${stars}`;
              const label = stars === 1 ? "1 star" : `${stars} stars`;

              return (
                <div key={stars} className="mb-1 flex w-full flex-nowrap items-center">
                  <label
                    htmlFor={barId}
                    className="min-w-11 shrink-0 text-right text-xs"
                  >
                    {label}
                  </label>
                  <progress
                    id={barId}
                    className="ml-2.5 h-2 w-full appearance-none bg-white xl:w-40 [&::-moz-progress-bar]:bg-[#FAE703] [&::-webkit-progress-bar]:bg-white [&::-webkit-progress-value]:bg-[#FAE703]"
                    value={valuePct}
                    max={100}
                    aria-label={`${label}: ${valuePct}%`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex basis-full items-center bg-zinc-50 lg:bg-inherit xl:basis-auto">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex w-full min-w-[120px] items-center justify-center whitespace-nowrap bg-[#F50028] px-2 py-2 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-red-700 xl:w-auto"
          >
            Write a review
          </button>
        </div>
      </div>

      <div id="reviews-list" className="scroll-mt-24">
        {reviews.length === 0 ? (
          <p className="text-center font-bold">No reviews</p>
        ) : (
          <ul className="flex flex-col gap-5">
            {reviews.map((review, index) => (
              <li
                key={`${review.nickname ?? "anon"}-${review.summary ?? ""}-${index}`}
                className="border-b border-gray-100 pb-5 last:border-0 last:pb-0"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{review.nickname ?? "Anonymous"}</p>
                    <ReviewDate raw={review.created_at} />
                  </div>
                  {typeof review.average_rating === "number" && review.average_rating > 0 ? (
                    <ReviewStarsRow value={review.average_rating} />
                  ) : null}
                </div>
                {review.summary ? (
                  <p className="mt-2 text-sm font-medium text-gray-900">{review.summary}</p>
                ) : null}
                {review.text ? (
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">{review.text}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {showPaginationNote ? (
        <p className="text-xs text-gray-500">
          Showing page {pageInfo?.current_page ?? 1} of {pageInfo?.total_pages}. Increase{" "}
          <code className="rounded bg-gray-100 px-1">pageSize</code> in the product query if you need
          more on one page.
        </p>
      ) : null}

      <WriteReviewDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        product={product}
        onSubmitted={refetchReviews}
      />
    </div>
  );
}
