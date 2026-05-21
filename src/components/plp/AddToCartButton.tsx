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
  /** Larger yellow PDP style with “ADD TO CART” */
  variant?: "default" | "pdp";
};

const buttonClassName =
  "flex w-full items-center justify-center gap-1.5 bg-[#FAE703] px-4 py-2 text-xs font-medium uppercase tracking-wide text-black transition-colors duration-300 hover:bg-black hover:text-white group-hover:bg-black group-hover:text-white disabled:opacity-60 md:py-3 md:text-sm";

const pdpButtonClassName =
  "btn btn-tocart flex flex-1 w-full items-center justify-center gap-2 bg-[#FAE703] px-4 text-sm uppercase tracking-wide text-black transition-colors duration-300 hover:bg-black hover:text-white disabled:opacity-60 h-10 font-bold md:h-12 md:text-base lg:h-[50px] lg:text-lg";

export default function AddToCartButton({
  productSku,
  className = "",
  onClick,
  disabled = false,
  loading = false,
  href,
  variant = "default",
}: AddToCartButtonProps) {
  const base = variant === "pdp" ? pdpButtonClassName : buttonClassName;
  const classNames = `${base} ${className}`.trim();

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
        <span>{loading ? "Adding..." : variant === "pdp" ? "ADD TO CART" : "Add to Cart"}</span>
      <CartIcon size={20} className="shrink-0" />
    </button>
  );
}
