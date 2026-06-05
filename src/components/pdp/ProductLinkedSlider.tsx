"use client";

import { useId, useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import { A11y, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductCard from "@/components/plp/ProductCard";
import type { ProductItem } from "@/framework/graphql/queries/products";

import "swiper/css";
import "swiper/css/navigation";

type ProductLinkedSliderProps = {
  title: string;
  products: ProductItem[];
};

function SliderNavChevron({ direction }: { direction: "prev" | "next" }) {
  const isNext = direction === "next";
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden className="text-[#F50028]">
      <path
        d={isNext ? "M1 1L8 8L1 15" : "M9 1L2 8L9 15"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProductLinkedSlider({ title, products }: ProductLinkedSliderProps) {
  const sliderId = useId().replace(/:/g, "");
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const bindNavigation = (swiper: SwiperType) => {
    const nav = swiper.params.navigation;
    if (!nav || typeof nav === "boolean") {
      return;
    }
    nav.prevEl = prevRef.current;
    nav.nextEl = nextRef.current;
    swiper.navigation.destroy();
    swiper.navigation.init();
    swiper.navigation.update();
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section
      className="product-linked-slider mt-10 border-t border-gray-200 pt-8 md:mt-12 md:pt-10"
      aria-labelledby={`${sliderId}-heading`}
    >
      <div className="mb-4 flex items-center justify-between gap-4 md:mb-6">
        <h2
          id={`${sliderId}-heading`}
          className="text-lg font-bold text-gray-900 md:text-xl lg:text-2xl"
        >
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <button
            ref={prevRef}
            type="button"
            className="product-linked-slider-prev flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors hover:border-[#F50028] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Previous ${title} items`}
          >
            <SliderNavChevron direction="prev" />
          </button>
          <button
            ref={nextRef}
            type="button"
            className="product-linked-slider-next flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors hover:border-[#F50028] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Next ${title} items`}
          >
            <SliderNavChevron direction="next" />
          </button>
        </div>
      </div>

      <Swiper
        modules={[Navigation, A11y]}
        spaceBetween={16}
        slidesPerView={1.15}
        watchOverflow
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={bindNavigation}
        onSwiper={bindNavigation}
        breakpoints={{
          480: { slidesPerView: 1.5, spaceBetween: 16 },
          640: { slidesPerView: 2.15, spaceBetween: 16 },
          1024: { slidesPerView: 3.15, spaceBetween: 20 },
          1280: { slidesPerView: 4, spaceBetween: 20 },
        }}
        className="product-linked-swiper"
      >
        {products.map((product) => (
          <SwiperSlide key={product.uid} className="!h-auto">
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
