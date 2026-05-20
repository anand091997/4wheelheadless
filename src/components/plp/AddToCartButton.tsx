"use client";

import Link from "next/link";
import { CartIcon, EyeIcon } from "@/components/Icon";

type AddToCartButtonProps = {
  productSku?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  href?: string;
};

const buttonClassName =
  "flex w-full items-center justify-center gap-1.5 bg-[#FAE703] px-4 py-2 text-xs font-medium uppercase tracking-wide text-black transition-colors duration-300 hover:bg-black hover:text-white group-hover:bg-black group-hover:text-white disabled:cursor-not-allowed disabled:opacity-60 md:py-3 md:text-sm cursor-pointer";

export default function AddToCartButton({
  productSku,
  className = "",
  onClick,
  disabled = false,
  loading = false,
  href,
}: AddToCartButtonProps) {
  const classNames = `${buttonClassName} ${className}`.trim();

  if (href) {
    return (
      <Link
        href={href}
        className={classNames}
        aria-label={productSku ? `View ${productSku}` : "View product"}
      >
        <span>View Product</span>
        <EyeIcon size={22} className="shrink-0" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={classNames}
      aria-label={productSku ? `Add ${productSku} to cart` : "Add to cart"}
      aria-busy={loading}
    >
      <span>{loading ? "Adding..." : "Add to Cart"}</span>
      <CartIcon size={20} className="shrink-0" />
    </button>
  );
}
