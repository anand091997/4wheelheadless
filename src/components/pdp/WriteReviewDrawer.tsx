"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { CloseIcon, StarIcon } from "@/components/Icon";
import { createProductReviewRequest } from "@/framework/graphql/mutations/createProductReview";
import type { ProductDetailItem } from "@/framework/graphql/queries/productDetail";
import {
  fetchProductReviewRatingsMetadata,
  type ProductReviewRatingMetaItem,
  type ProductReviewRatingValue,
} from "@/framework/graphql/queries/productReviewRatingsMetadata";

function orderRatingValuesByStarAsc(values: ProductReviewRatingValue[]) {
  return [...values].sort((a, b) => {
    const na = Number.parseInt(String(a.value).match(/^(\d)/)?.[1] ?? "99", 10);
    const nb = Number.parseInt(String(b.value).match(/^(\d)/)?.[1] ?? "99", 10);
    if (na !== nb) {
      return na - nb;
    }
    return String(a.value_id).localeCompare(String(b.value_id));
  });
}

type ReviewFormValues = {
  nickname: string;
  summary: string;
  text: string;
};

type WriteReviewDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDetailItem;
  onSubmitted: () => Promise<void>;
};

export default function WriteReviewDrawer({
  isOpen,
  onClose,
  product,
  onSubmitted,
}: WriteReviewDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [ratingMeta, setRatingMeta] = useState<ProductReviewRatingMetaItem[]>([]);
  const [metaStatus, setMetaStatus] = useState<"loading" | "ready" | "empty">("loading");
  const [ratingSelections, setRatingSelections] = useState<Record<string, string>>({});
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState } = useForm<ReviewFormValues>({
    defaultValues: { nickname: "", summary: "", text: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    let cancelled = false;
    setMetaStatus("loading");
    fetchProductReviewRatingsMetadata()
      .then((items) => {
        if (cancelled) {
          return;
        }
        const list = items ?? [];
        setRatingMeta(list);
        setMetaStatus(list.length > 0 ? "ready" : "empty");
      })
      .catch(() => {
        if (!cancelled) {
          setRatingMeta([]);
          setMetaStatus("empty");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      reset();
      setRatingSelections({});
      setRatingError(null);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [isOpen, onClose]);

  const validateRatings = useCallback(() => {
    if (ratingMeta.length === 0) {
      setRatingError("Rating is not available. Check Magento rating settings.");
      return false;
    }
    const missing = ratingMeta.find((row) => !ratingSelections[row.id]?.trim());
    if (missing) {
      setRatingError(
        missing.name
          ? `Please select ${missing.name.toLowerCase()}.`
          : "Please select a star rating.",
      );
      return false;
    }
    setRatingError(null);
    return true;
  }, [ratingMeta, ratingSelections]);

  const onSubmit = handleSubmit(
    async (values) => {
      if (!validateRatings()) {
        return;
      }

      const ratings = ratingMeta.map((row) => ({
        id: row.id,
        value_id: ratingSelections[row.id]!.trim(),
      }));

      console.log("ratings", ratings);

      setSubmitting(true);
      try {
        await createProductReviewRequest({
          sku: product.sku,
          nickname: values.nickname.trim(),
          summary: values.summary.trim(),
          text: values.text.trim(),
          ratings,
        });
        toast.success("Thanks — your review was submitted.");
        await onSubmitted();
        onClose();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not submit review. You may need to sign in.";
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
    () => {
      validateRatings();
    },
  );

  const setStarForFirstDimension = useCallback(
    (starIndex1To5: number) => {
      const row = ratingMeta[0];
      if (!row?.values?.length) {
        return;
      }
      const ordered = orderRatingValuesByStarAsc(row.values);
      const pick = ordered[starIndex1To5 - 1];
      if (pick?.value_id) {
        setRatingSelections((previous) => ({ ...previous, [row.id]: pick.value_id }));
        setRatingError(null);
      }
    },
    [ratingMeta],
  );

  const inputBorder = (hasError: boolean) =>
    hasError ? "border-red-600 focus:border-red-600" : "border-gray-300";

  const canSubmit = metaStatus === "ready" && !submitting;
  const showStarRow =
    ratingMeta.length === 1 && (ratingMeta[0].values?.length ?? 0) >= 5;

  const starRowMeta = showStarRow ? ratingMeta[0] : null;
  const orderedStarValues = starRowMeta
    ? orderRatingValuesByStarAsc(starRowMeta.values ?? [])
    : [];
  const selectedStarIndex = starRowMeta
    ? orderedStarValues.findIndex(
        (opt) => opt.value_id === ratingSelections[starRowMeta.id]?.trim(),
      ) + 1
    : 0;

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  const drawer = (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Close review form"
        onClick={onClose}
      />
      <aside
        className="relative flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-review-title"
      >
        <div className="modal-header flex justify-between w-full text-right items-start px-7 py-6">
          <h2 id="write-review-title" className="text-lg md:text-2xl font-bold text-left">
            Write a Customer Review
          </h2>            
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded p-1 text-[#F50028] transition hover:bg-gray-100"
            aria-label="Close"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <p className="text-xs px-7">
          You&apos;re reviewing:{" "}
          <span className="font-semibold">{product.name}</span>
        </p>

        <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-1 flex-col gap-4 pt-6 px-7">
            <div className="border-b border-[#d2d2d2] pb-3">
              <p className="mb-2 text-sm font-medium">
                Rating:
              </p>
              {metaStatus === "loading" ? (
                <p className="text-xs text-gray-500">Loading ratings…</p>
              ) : showStarRow ? (
                <div
                  className={`flex ${ratingError ? "ring-1 ring-red-600" : ""}`}
                  role="group"
                  aria-label="Overall rating"
                  aria-invalid={Boolean(ratingError)}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = selectedStarIndex > 0 && star <= selectedStarIndex;
                    return (
                      <button
                        key={star}
                        type="button"
                        className={filled ? "text-[#fcbf21]" : "text-[#b3b3b3]"}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        aria-pressed={filled}
                        onClick={() => setStarForFirstDimension(star)}
                      >
                        <StarIcon size={36} className="h-9 w-9" />
                      </button>
                    );
                  })}
                </div>
              ) : ratingMeta.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {ratingMeta.map((row) => (
                    <div key={row.id}>
                      <p className="mb-1 text-xs font-semibold uppercase text-gray-600">
                        {row.name} <span className="text-red-600">*</span>
                      </p>
                      <div
                        className={`flex flex-wrap gap-2 rounded p-1 ${
                          ratingError ? "ring-1 ring-red-600" : ""
                        }`}
                      >
                        {(row.values ?? []).map((opt) => (
                          <label
                            key={opt.value_id}
                            className={`rounded border px-2.5 py-1 text-xs ${
                              ratingSelections[row.id] === opt.value_id
                                ? "border-[#F50028] bg-red-50 font-medium"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`dr-${row.id}`}
                              className="sr-only"
                              checked={ratingSelections[row.id] === opt.value_id}
                              onChange={() => {
                                setRatingSelections((previous) => ({
                                  ...previous,
                                  [row.id]: opt.value_id,
                                }));
                                setRatingError(null);
                              }}
                            />
                            {opt.value}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-amber-800">
                  Rating options are not configured in Magento (Stores → Attributes → Rating).
                </p>
              )}
              {ratingError ? (
                <p className="mt-1 text-xs text-red-600">{ratingError}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="wr-nickname" className="sr-only">
                Nickname <span className="text-red-600">*</span>
              </label>
              <input
                id="wr-nickname"
                type="text"
                placeholder="Nickname"
                aria-invalid={Boolean(formState.errors.nickname)}
                className={`w-full border px-3 py-2 text-sm h-10 md:h-11 ${inputBorder(Boolean(formState.errors.nickname))}`}
                {...register("nickname", {
                  required: "Nickname is required.",
                  minLength: { value: 2, message: "At least 2 characters." },
                })}
              />
              {formState.errors.nickname?.message ? (
                <p className="mt-1 text-xs text-red-600">{formState.errors.nickname.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="wr-summary" className="sr-only">
                Review title <span className="text-red-600">*</span>
              </label>
              <input
                id="wr-summary"
                type="text"
                placeholder="Title of your review"
                aria-invalid={Boolean(formState.errors.summary)}
                className={`w-full border px-3 py-2 text-sm h-10 md:h-11 ${inputBorder(Boolean(formState.errors.summary))}`}
                {...register("summary", {
                  required: "Review title is required.",
                  minLength: { value: 3, message: "At least 3 characters." },
                })}
              />
              {formState.errors.summary?.message ? (
                <p className="mt-1 text-xs text-red-600">{formState.errors.summary.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="wr-text" className="sr-only">
                Your review <span className="text-red-600">*</span>
              </label>
              <textarea
                id="wr-text"
                rows={3}
                cols={5}
                placeholder="Your Review"
                aria-invalid={Boolean(formState.errors.text)}
                className={`w-full resize-y border px-3 py-2 text-sm min-h-10 md:min-h-11 ${inputBorder(Boolean(formState.errors.text))}`}
                {...register("text", {
                  required: "Your review is required.",
                  minLength: { value: 10, message: "At least 10 characters." },
                })}
              />
              {formState.errors.text?.message ? (
                <p className="mt-1 text-xs text-red-600">{formState.errors.text.message}</p>
              ) : null}
            </div>
          </div>

          <div className="bg-[linear-gradient(180deg,#FFFFFF_0%,#EFEFEF_100%)] drop-shadow-xl p-7 mt-auto w-full sticky bottom-0 border-t border-gray-100 bg-white">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-orange-500 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              {submitting ? "Posting…" : "POST YOUR REVIEW"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );

  return createPortal(drawer, document.body);
}
