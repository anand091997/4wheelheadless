import { StarIcon } from "@/components/Icon";

function averageToStarsOutOf5(average: number | null | undefined): number {
  if (typeof average !== "number" || Number.isNaN(average)) {
    return 0;
  }
  return average > 5 ? average / 20 : average;
}

type ProductRatingSummaryProps = {
  reviewCount?: number | null;
  ratingSummary?: number | null;
  className?: string;
};

export default function ProductRatingSummary({
  reviewCount = 0,
  ratingSummary = 0,
  className = "",
}: ProductRatingSummaryProps) {
  const count = reviewCount ?? 0;
  const hasReviews = count > 0;
  const starsOutOf5 = averageToStarsOutOf5(ratingSummary);
  const roundedStars = hasReviews ? Math.round(Math.min(5, Math.max(0, starsOutOf5))) : 0;
  const reviewLabel = hasReviews
    ? `${count} ${count === 1 ? "Review" : "Reviews"}`
    : "No Reviews";

  return (
    <div
      className={`flex flex-wrap items-center gap-2 md:gap-0 text-sm text-gray-900 ${className}`.trim()}
      aria-label={
        hasReviews
          ? `Rated ${roundedStars} out of 5, ${reviewLabel}`
          : "No reviews yet"
      }
    >
      <div className="flex items-center" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon
            key={i}
            size={32}
            className={`shrink-0 ${
              hasReviews && i <= roundedStars ? "text-[#FCBF21]" : "text-gray-200"
            }`}
          />
        ))}
      </div>

      {hasReviews ? (
        <span className="pl-2 text-xs">({roundedStars})</span>
      ) : null}

      <span className="block w-full md:w-auto md:ml-2 md:pl-2 text-xs md:border-l md:border-solid md:border-[#d2d2d2]">{reviewLabel}</span>
    </div>
  );
}
