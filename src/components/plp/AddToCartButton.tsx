"use client";

import { CartIcon } from "@/components/Icon";

type AddToCartButtonProps = {
  productSku?: string;
  className?: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function AddToCartButton({
  productSku,
  className = "",
  onClick,
  disabled = false,
  loading = false,
}: AddToCartButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex w-full items-center justify-center gap-1.5 bg-[#FAE703] px-4 py-2 text-xs font-medium uppercase tracking-wide text-black transition-colors duration-300 hover:bg-black hover:text-white group-hover:bg-black group-hover:text-white disabled:cursor-not-allowed disabled:opacity-60 md:py-3 md:text-sm cursor-pointer ${className}`.trim()}
      aria-label={productSku ? `Add ${productSku} to cart` : "Add to cart"}
      aria-busy={loading}
    >
      <span>{loading ? "Adding..." : "Add to Cart"}</span>
      <CartIcon size={20} className="shrink-0" />
    </button>
  );
}
