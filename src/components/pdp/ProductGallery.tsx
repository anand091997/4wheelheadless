"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { A11y, Keyboard, Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { CloseIcon, CompareIcon, WishlistIcon } from "@/components/Icon";
import type { ProductDisplayImage } from "@/lib/configurableProduct";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

type ProductGalleryProps = {
  slides: ProductDisplayImage[];
  productName: string;
  /** When set (e.g. configurable variant URL), main gallery jumps to the matching slide. */
  activeSlideUrl?: string | null;
};

/** Placeholder while Swiper mounts (SSR-safe; use with `dynamic(..., { ssr: false })`). */
export function ProductGallerySkeleton({ showThumbs = true }: { showThumbs?: boolean }) {
  return (
    <div className="flex flex-col gap-3 bg-white md:flex-row md:items-start md:gap-4">
      {showThumbs ? (
        <div
          className="order-2 h-[76px] w-full shrink-0 animate-pulse rounded-md bg-gray-100 md:order-1 md:h-[420px] md:w-[90px]"
          aria-hidden
        />
      ) : null}
      <div className="relative order-1 w-full max-md:mx-auto md:order-2 md:min-h-0 md:flex-1">
        <div
          className="relative aspect-square w-full animate-pulse rounded-md bg-gray-100 md:max-w-none"
          aria-hidden
        />
      </div>
    </div>
  );
}

function GalleryNavChevron({ direction, muted }: { direction: "prev" | "next"; muted?: boolean }) {
  const isNext = direction === "next";
  return (
    <svg
      width="10"
      height="16"
      viewBox="0 0 10 16"
      fill="none"
      aria-hidden
      className={muted ? "text-gray-300" : isNext ? "text-[#F50028]" : "text-[#F50028]"}
    >
      <path
        d={isNext ? "M2 2L8 8L2 14" : "M8 2L2 8L8 14"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProductGallery({
  slides,
  productName,
  activeSlideUrl,
}: ProductGalleryProps) {
  const [clientReady, setClientReady] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [verticalThumbs, setVerticalThumbs] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxActiveIndex, setLightboxActiveIndex] = useState(0);
  const [thumbActiveIndex, setThumbActiveIndex] = useState(0);

  const mainSwiperRef = useRef<SwiperType | null>(null);
  const mainPrevRef = useRef<HTMLButtonElement>(null);
  const mainNextRef = useRef<HTMLButtonElement>(null);
  const lightboxPrevRef = useRef<HTMLButtonElement>(null);
  const lightboxNextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setVerticalThumbs(mq.matches);
    update();
    mq.addEventListener("change", update);
    setClientReady(true);
    return () => mq.removeEventListener("change", update);
  }, []);

  const bindMainNavigation = useCallback((swiper: SwiperType) => {
    mainSwiperRef.current = swiper;
    const nav = swiper.params.navigation;
    if (nav && typeof nav === "object") {
      nav.prevEl = mainPrevRef.current;
      nav.nextEl = mainNextRef.current;
    }
    swiper.navigation?.destroy();
    swiper.navigation?.init();
    swiper.navigation?.update();
    setThumbActiveIndex(swiper.activeIndex);
  }, []);

  const bindLightboxNavigation = useCallback((swiper: SwiperType) => {
    const nav = swiper.params.navigation;
    if (nav && typeof nav === "object") {
      nav.prevEl = lightboxPrevRef.current;
      nav.nextEl = lightboxNextRef.current;
    }
    swiper.navigation?.destroy();
    swiper.navigation?.init();
    swiper.navigation?.update();
    setLightboxActiveIndex(swiper.activeIndex);
  }, []);

  useEffect(() => {
    const url = activeSlideUrl?.trim();
    const swiper = mainSwiperRef.current;
    if (!url || !swiper || slides.length === 0) {
      return;
    }
    const index = slides.findIndex((s) => s.url.trim() === url);
    if (index >= 0) {
      if (swiper.activeIndex !== index) {
        swiper.slideTo(index);
      }
      setThumbActiveIndex(index);
    }
  }, [activeSlideUrl, slides]);

  useEffect(() => {
    setThumbActiveIndex((index) => (index >= slides.length ? 0 : index));
    setLightboxActiveIndex((index) => (index >= slides.length ? 0 : index));
  }, [slides.length]);

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen]);

  const openLightbox = useCallback(() => {
    const index = mainSwiperRef.current?.activeIndex ?? 0;
    setLightboxIndex(index);
    setLightboxActiveIndex(index);
    setLightboxOpen(true);
  }, []);

  const handleThumbSwiperClick = useCallback((swiper: SwiperType) => {
    const index = swiper.clickedIndex;
    if (typeof index !== "number" || index < 0) {
      return;
    }
    mainSwiperRef.current?.slideTo(index);
    setThumbActiveIndex(index);
  }, []);

  const showThumbs = slides.length > 1;
  const showNav = slides.length > 1;

  if (slides.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-500">
        No image
      </div>
    );
  }

  if (!clientReady) {
    return <ProductGallerySkeleton showThumbs={showThumbs} />;
  }

  const thumbsSwiperInstance =
    thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null;

  const lastSlideIndex = slides.length - 1;
  const mainPrevDisabled = thumbActiveIndex <= 0;
  const mainNextDisabled = thumbActiveIndex >= lastSlideIndex;
  const lightboxPrevDisabled = lightboxActiveIndex <= 0;
  const lightboxNextDisabled = lightboxActiveIndex >= lastSlideIndex;

  const navBtnClass =
    "absolute top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded border shadow-sm transition md:h-11 md:w-11";
  const lightboxNavBtnClass =
    "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded border shadow-sm transition md:h-11 md:w-11";
  const navBtnEnabled = "border-gray-200 bg-white/90 hover:bg-white";
  const navBtnDisabled = "border-gray-200 bg-gray-50/90 opacity-45";
  const slideNodes = slides.map((slide, index) => (
    <SwiperSlide
      key={`${slide.url}-${index}`}
      className="!flex h-full items-center justify-center bg-white"
    >
      <button
        type="button"
        className="flex h-full min-h-0 w-full cursor-zoom-in items-center justify-center"
        onClick={openLightbox}
        aria-label={`Open image ${index + 1} in gallery viewer`}
      >
        <img
          src={slide.url}
          alt={slide.label || productName}
          className="max-h-full max-w-full object-contain"
          width={800}
          height={800}
          loading={index === 0 ? "eager" : "lazy"}
        />
      </button>
    </SwiperSlide>
  ));

  const thumbSlides = slides.map((slide, index) => (
    <SwiperSlide
      key={`thumb-${slide.url}-${index}`}
      data-pdp-thumb-active={index === thumbActiveIndex ? "true" : "false"}
      className={`pdp-gallery-thumb-slide overflow-hidden p-1 ${
        verticalThumbs
          ? "!h-[72px] !w-[72px] md:!h-[90px] md:!w-[90px]"
          : "!h-[68px] !w-[68px]"
      }`}
    >
      <img
        src={slide.url}
        alt=""
        className="h-full w-full object-contain"
        width={80}
        height={80}
      />
    </SwiperSlide>
  ));

  return (
    <>
      <div className="flex flex-col gap-3 bg-white md:flex-row md:items-start md:gap-4">
        {showThumbs ? (
          <div
            className={`order-2 w-full shrink-0 md:order-1 ${
              verticalThumbs ? "h-[76px] md:h-[420px] md:w-[95px]" : "h-[76px]"
            }`}
          >
            <Swiper
              key={verticalThumbs ? "thumbs-v" : "thumbs-h"}
              direction={verticalThumbs ? "vertical" : "horizontal"}
              spaceBetween={8}
              slidesPerView="auto"
              watchSlidesProgress
              slideToClickedSlide
              className="h-full w-full"
              onSwiper={setThumbsSwiper}
              onClick={handleThumbSwiperClick}
            >
              {thumbSlides}
            </Swiper>
          </div>
        ) : null}

        <div className="relative order-1 w-full max-md:mx-auto md:order-2 md:min-h-0 md:flex-1 border border-[#efefef] p-2">
          {/* Square box defines height; main Swiper fills it (in-flow Swiper was collapsing) */}
          <div className="relative aspect-square w-full md:max-w-none">
            <div className="flex flex-col absolute right-2 top-2 gap-y-3 z-10">
              <button
                type="button"
                className="pointer-events-auto rounded-md text-[#51565b] transition-colors hover:bg-gray-100"
                aria-label="Add to wishlist"
              >
                <WishlistIcon size={22} className="h-5 w-5 md:h-6 md:w-6" />
              </button>
              <button
                type="button"
                className="pointer-events-auto rounded-md text-[#51565b] transition-colors hover:bg-gray-100"
                aria-label="Add to compare"
              >
                <CompareIcon size={22} className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </div>

            {showNav ? (
              <>
                <button
                  ref={mainPrevRef}
                  type="button"
                  disabled={mainPrevDisabled}
                  aria-disabled={mainPrevDisabled}
                  aria-label="Previous image"
                  className={`pdp-gallery-main-prev left-1 md:left-2 ${navBtnClass} ${
                    mainPrevDisabled ? navBtnDisabled : navBtnEnabled
                  }`}
                >
                  <GalleryNavChevron direction="prev" muted={mainPrevDisabled} />
                </button>
                <button
                  ref={mainNextRef}
                  type="button"
                  disabled={mainNextDisabled}
                  aria-disabled={mainNextDisabled}
                  aria-label="Next image"
                  className={`pdp-gallery-main-next right-1 md:right-2 ${navBtnClass} ${
                    mainNextDisabled ? navBtnDisabled : navBtnEnabled
                  }`}
                >
                  <GalleryNavChevron direction="next" muted={mainNextDisabled} />
                </button>
              </>
            ) : null}

            <Swiper
              modules={[Navigation, Thumbs, Keyboard, A11y]}
              spaceBetween={0}
              slidesPerView={1}
              keyboard={{ enabled: true }}
              thumbs={
                thumbsSwiperInstance
                  ? {
                      swiper: thumbsSwiperInstance,
                      slideThumbActiveClass: "pdp-gallery-thumb-active",
                    }
                  : undefined
              }
              onSwiper={bindMainNavigation}
              onSlideChange={(swiper) => setThumbActiveIndex(swiper.activeIndex)}
              className="pdp-main-swiper !absolute inset-0 h-full w-full"
            >
              {slideNodes}
            </Swiper>
          </div>
        </div>
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Product gallery"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setLightboxOpen(false);
            }
          }}
        >
          <div
            className="relative w-full max-w-[1270px] bg-white p-4 shadow-xl md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-2 top-2 z-10 rounded p-1 text-[#F50028] transition hover:bg-gray-100"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close gallery"
            >
              <CloseIcon size={24} />
            </button>

            {showNav ? (
              <>
                <button
                  ref={lightboxPrevRef}
                  type="button"
                  disabled={lightboxPrevDisabled}
                  aria-disabled={lightboxPrevDisabled}
                  aria-label="Previous image"
                  className={`pdp-lightbox-prev left-3 ${lightboxNavBtnClass} ${
                    lightboxPrevDisabled ? navBtnDisabled : "border-gray-200 bg-white/95 hover:bg-white"
                  }`}
                >
                  <GalleryNavChevron direction="prev" muted={lightboxPrevDisabled} />
                </button>
                <button
                  ref={lightboxNextRef}
                  type="button"
                  disabled={lightboxNextDisabled}
                  aria-disabled={lightboxNextDisabled}
                  aria-label="Next image"
                  className={`pdp-lightbox-next right-3 ${lightboxNavBtnClass} ${
                    lightboxNextDisabled ? navBtnDisabled : "border-gray-200 bg-white/95 hover:bg-white"
                  }`}
                >
                  <GalleryNavChevron direction="next" muted={lightboxNextDisabled} />
                </button>
              </>
            ) : null}

            <Swiper
              key={lightboxIndex}
              modules={[Navigation, Keyboard, A11y]}
              initialSlide={lightboxIndex}
              slidesPerView={1}
              keyboard={{ enabled: true }}
              className="w-full pt-8"
              onSwiper={bindLightboxNavigation}
              onSlideChange={(swiper) => setLightboxActiveIndex(swiper.activeIndex)}
            >
              {slides.map((slide, index) => (
                <SwiperSlide
                  key={`lb-${slide.url}-${index}`}
                  className="!flex items-center justify-center"
                >
                  <img
                    src={slide.url}
                    alt={slide.label || productName}
                    className="max-h-[min(75vh,720px)] max-w-full object-contain"
                    width={900}
                    height={900}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      ) : null}
    </>
  );
}
