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
  /** PLP card | PDP row (with qty) | PDP full width (grouped) */
  variant?: "default" | "pdp" | "pdp-row" | "pdp-full";
};

const buttonClassName =
  "flex w-full items-center justify-center gap-1.5 bg-[#FAE703] px-4 py-2 text-xs font-medium uppercase tracking-wide text-black transition-colors duration-300 hover:bg-black hover:text-white group-hover:bg-black group-hover:text-white disabled:opacity-60 md:py-3 md:text-sm";

/** Simple/configurable PDP — shares row with qty stepper */
const pdpRowButtonClassName =
  "btn btn-tocart flex h-10 min-w-0 flex-1 items-center justify-center gap-2 bg-[#FAE703] px-4 text-sm font-bold uppercase tracking-wide text-black transition-colors duration-300 hover:bg-black hover:text-white disabled:opacity-60 md:h-12 md:text-base lg:h-[50px] lg:text-lg";

/** Bundle PDP — same row layout, frozen class string for stable SSR */
const pdpBundleRowButtonClassName = pdpRowButtonClassName;

/** Grouped PDP — full width below table */
const pdpFullWidthButtonClassName =
  "pdp-addtocart-full box-border flex h-10 w-full max-w-full items-center justify-center gap-2 border-0 bg-[#FAE703] px-4 text-sm font-bold uppercase tracking-wide text-black transition-colors duration-300 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-60 md:h-12 md:text-base lg:h-[50px] lg:text-lg";

function resolveButtonClassName(variant: AddToCartButtonProps["variant"], extra?: string): string {
  const base =
    variant === "pdp-full"
      ? pdpFullWidthButtonClassName
      : variant === "pdp-row"
        ? pdpBundleRowButtonClassName
        : variant === "pdp"
          ? pdpRowButtonClassName
          : buttonClassName;

  if (!extra?.trim()) {
    return base;
  }

  return `${base} ${extra.trim()}`;
}

function buttonLabel(loading: boolean, variant: AddToCartButtonProps["variant"]): string {
  if (loading) {
    return "Adding...";
  }
  if (variant === "pdp" || variant === "pdp-row" || variant === "pdp-full") {
    return "ADD TO CART";
  }
  return "Add to Cart";
}

export default function AddToCartButton({
  productSku,
  className = "",
  onClick,
  disabled = false,
  loading = false,
  href,
  variant = "default",
}: AddToCartButtonProps) {
  const classNames = resolveButtonClassName(variant, className);
  const label = buttonLabel(loading, variant);
  const iconSize = variant === "pdp-full" ? 22 : 20;

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
      <span className="shrink-0">{label}</span>
      <CartIcon size={iconSize} className="shrink-0" aria-hidden />
    </button>
  );
}
