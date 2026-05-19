"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BackIcon,
  ArrowDownIcon,
  CallSingleIcon,
  CallIcon,
  CartIcon,
  HamburgurIcon,
  SearchNewIcon,
  UserIcon,
} from "@/components/Icon";
import type { HeaderCategory, StoreConfig } from "@/framework/graphql";

type HeaderProps = {
  cartCount?: number;
  storeConfig?: StoreConfig | null;
  categories?: HeaderCategory[];
};

function categoryHref(urlPath?: string | null) {
  if (!urlPath) return "#";
  return `/${urlPath.replace(/^\/+/, "")}`;
}

export default function Header({
  cartCount = 0,
  storeConfig,
  categories = [],
}: HeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [level1, setLevel1] = useState<HeaderCategory | null>(null);
  const [level2, setLevel2] = useState<HeaderCategory | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const hasChildren = (cat: HeaderCategory) =>
    cat.children && cat.children.length > 0;

  const badge =
    cartCount > 99 ? "99+" : String(Math.max(0, cartCount)).padStart(2, "0");

  const rootCategories = useMemo(
    () => categories.filter((c) => c.name?.trim()),
    [categories]
  );

  const closeMenu = () => {
    setIsMenuOpen(false);
    setLevel1(null);
    setLevel2(null);
  };

  const navigateAndClose = (urlPath?: string | null) => {
    const href = categoryHref(urlPath);
    closeMenu();
    router.push(href);
  };

  // OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // LOGO (UNCHANGED)
  const logoWidth =
    storeConfig?.logo_width && storeConfig.logo_width > 0
      ? storeConfig.logo_width
      : 180;

  const logoHeight =
    storeConfig?.logo_height && storeConfig.logo_height > 0
      ? storeConfig.logo_height
      : 60;

  const logoAlt = storeConfig?.logo_alt?.trim() || "Store logo";

  const logoPath = storeConfig?.header_logo_src?.trim() ?? "";
  const mediaBaseUrl = storeConfig?.secure_base_media_url?.trim() ?? "";

  const logoSrc = logoPath
    ? logoPath.startsWith("http")
      ? logoPath.replace("/media/stores/", "/media/logo/stores/")
      : `${mediaBaseUrl.replace(/\/$/, "")}/${logoPath
          .replace(/^\//, "")
          .replace(/^stores\//, "logo/stores/")}`
    : "";

  return (
    <header className="relative border-b-[3px] border-b-[#9b1b7a] bg-white pt-2 md:py-2">
      
      {/* HEADER */}
      <div className="container md:flex min-h-[68px] items-center justify-between max-md:flex-wrap flex">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isMenuOpen) {
                closeMenu();
              } else {
                setIsMenuOpen(true);
              }
            }}
          >
            <HamburgurIcon size={22} />
          </button>

          <Link href="/">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={logoAlt}
                width={logoWidth}
                height={logoHeight}
              />
            ) : (
              <span className="font-bold text-xl">LOGO</span>
            )}
          </Link>
        </div>

        {/* Search (desktop/static) */}
        <div className="flex md:flex-1 items-center justify-center md:px-6 max-md:px-4 max-md:py-2.5 max-md:order-3 max-md:bg-[#efefef] max-md:mt-3 max-md:-mx-4 max-md:w-[calc(100%+32px)]">
          <div className="flex items-center justify-between w-full max-w-[706px] bg-white relative">
            <input
              type="text"
              placeholder="Search by Part Name, Part Number, Vehicle or Brand"
              className="flex-1 py-2 px-4 min-h-[44px] bg-transparent outline-none text-sm placeholder-gray-500 border border-[#d2d2d2]"
            />
            <SearchNewIcon size={18} className="text-gray-600 shrink-0 absolute right-2.5" />
          </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-8">
          {/* Icon with dropdown caret (visual only) */}
          <div className="flex items-center leading-none gap-1">
            <CallIcon size={36} />
            <ArrowDownIcon size={12} className="mt-1" />
          </div>

          <div className="flex items-center leading-none gap-1">
            <UserIcon size={30} />
            <ArrowDownIcon size={12} className="mt-1" />
          </div>

          <Link href="/cart" className="relative">
            <CartIcon size={30} />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1 rounded-full">
              {badge}
            </span>
          </Link>
        </div>
      </div>

      {/* MENU */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* MENU WRAPPER */}
          <div ref={menuRef} className="relative flex h-full">

            {/* OVERLAY */}
            <div
              className="absolute inset-0 bg-[rgba(39,39,42,.5)]"
              onClick={closeMenu}
            ></div>
          
            {/* LEFT PANEL */}
            <div
              className={`w-[320px] bg-white h-full overflow-y-auto z-50 border-r border-[#efefef]
              transform transition-transform duration-300 ease-in-out
              ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
              ${level1 ? "hidden lg:block" : ""}`}
            >
              <button
                onClick={closeMenu}
                className="text-red-500 text-2xl ml-auto block px-4 pt-2"
              >
                ✕
              </button>

              <ul className="space-y-5 text-sm px-7 pb-6 mb-5 border-b border-[#efefef]">
                <li className="flex gap-3 items-center">
                  <UserIcon size={24} />
                  <div className="text-[#51565b]">
                    <b className="leading-normal block">My Account</b>
                    <div className="text-xs">Hello, Sign in</div>
                  </div>
                </li>

                <li className="flex gap-3 items-center">
                  <CallSingleIcon size={24} />
                  <div className="text-[#51565b]">
                    <b className="leading-normal block">Sales & Support</b>
                    <div className="text-xs">877-474-4821</div>
                  </div>
                </li>
              </ul>

              <ul className="space-y-2 px-7 text-[#51565b]">
                {rootCategories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        if (hasChildren(cat)) {
                          setLevel1(cat);
                          setLevel2(null);
                        } else {
                          navigateAndClose(cat.url_path);
                        }
                      }}
                      className="flex justify-between w-full text-left items-center uppercase"
                    >
                      {cat.name}

                      {hasChildren(cat) && (
                        <ArrowDownIcon
                          size={12}
                          className="transition-transform rotate-[-90deg]"
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT PANEL */}
            {/* LEVEL 2 */}
            {level1 && (
              <div
                className={`bg-white p-4 lg:p-6 z-50 border-r border-[#efefef] text-[#51565b]
                absolute w-[320px] inset-0 overflow-y-auto
                ${level2 ? "hidden lg:block" : "block"}
                lg:static lg:overflow-y-auto`}
                >
                <div className="flex items-center gap-x-2 pb-4 mb-4 border-b border-[#efefef]">
                  <button
                    type="button"
                    onClick={() => {
                      setLevel1(null);
                      setLevel2(null);
                    }}
                    className="lg:hidden text-sm font-semibold flex items-center gap-1"
                  >
                    <BackIcon size={20} />
                  </button>
                  <h3 className="cat-header text-left text-lg font-bold lg:font-medium text-black">
                    {level1.name}
                  </h3>
                </div>

                <ul className="space-y-2 text-[#51565b] py-2.5 lg:pl-10">
                  {level1.children?.map((cat) => (
                    <li key={cat.id} className="mb-3.5">
                      <button
                        onClick={() => {
                          if (hasChildren(cat)) {
                            setLevel2(cat);
                          } else {
                            navigateAndClose(cat.url_path);
                          }
                        }}
                        className="flex justify-between w-full text-left items-center"
                      >
                        {cat.name}

                        {hasChildren(cat) && (
                          <ArrowDownIcon size={12} className="rotate-[-90deg]" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* LEVEL 3 */}
            {level2 && (
              <div
                className={`bg-white p-4 lg:p-6 z-50 border-r border-[#efefef] text-[#51565b]
                absolute inset-0 overflow-y-auto
                lg:static w-[320px] lg:overflow-y-auto`}
              >
                <div className="flex items-center gap-x-2 pb-4 mb-4 border-b border-[#efefef]">
                  <button
                    type="button"
                    onClick={() => setLevel2(null)}
                    className="lg:hidden text-sm font-semibold flex items-center gap-1"
                  >
                    <BackIcon size={20} />
                  </button>
                  <h3 className="cat-header text-left text-lg font-bold lg:font-medium text-black">
                    {level2.name}
                  </h3>
                </div>

                <ul className="space-y-1 text-[#51565b] py-2.5">
                  {level2.children?.map((cat) => (
                    <li key={cat.id} className="mb-3.5">
                      <Link
                        href={categoryHref(cat.url_path)}
                        onClick={closeMenu}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}