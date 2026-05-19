"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CommonLoader from "@/components/CommonLoader";
import { CloseIcon } from "@/components/Icon";
import {
  getBrowserApolloClient,
  PRODUCTS_QUERY,
  type ProductAggregation,
  type ProductsQueryResult,
} from "@/framework/graphql";
import FilterSidebar from "./FilterSidebar";
import Pagination from "./Pagination";
import ProductGrid from "./ProductGrid";
import ProductList from "./ProductList";
import ProductTable from "./ProductTable";
import SortBar from "./SortBar";
import { SORT_OPTIONS, type FilterSelection, type ViewMode } from "./types";

const DEFAULT_CATEGORY_ID = "3";
const DEFAULT_SORT = "position_ASC";
const GRID_PAGE_SIZE = 12;
const LIST_PAGE_SIZE = 10;
const TABLE_PAGE_SIZE = 5;
const SIDEBAR_WIDTH_PX = 310;
const RESERVED_PARAMS = new Set([
  "page",
  "sort",
  "view",
  "category_id",
  "limit",
]);

function parseFilters(params: URLSearchParams): FilterSelection {
  const filters: FilterSelection = {};

  for (const [key, value] of params.entries()) {
    if (!key || !value || RESERVED_PARAMS.has(key)) {
      continue;
    }

    if (!filters[key]) {
      filters[key] = [];
    }
    if (!filters[key].includes(value)) {
      filters[key].push(value);
    }
  }

  return filters;
}

function parsePositiveNumber(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseSort(sortValue: string) {
  const [field, direction] = sortValue.split("_");
  const normalizedDirection = direction === "DESC" ? "DESC" : "ASC";
  const normalizedField = field || "position";

  return {
    [normalizedField]: normalizedDirection,
  };
}

function parseViewMode(viewValue: string | null): ViewMode {
  if (viewValue === "list") {
    return "list";
  }
  if (viewValue === "table") {
    return "table";
  }
  return "grid";
}

function getDefaultPageSize(mode: ViewMode) {
  if (mode === "list") {
    return LIST_PAGE_SIZE;
  }
  if (mode === "table") {
    return TABLE_PAGE_SIZE;
  }
  return GRID_PAGE_SIZE;
}

function buildFiltersInput(categoryId: string, selectedFilters: FilterSelection) {
  const input: Record<string, { in?: string[]; eq?: string; from?: string; to?: string }> = {};
  const selectedCategoryUids = selectedFilters.category_uid ?? [];
  const selectedCategoryIds = selectedFilters.category_id ?? [];

  if (!selectedCategoryUids.length && !selectedCategoryIds.length) {
    input.category_id = { eq: categoryId };
  }

  for (const [attributeCode, values] of Object.entries(selectedFilters)) {
    if (!values.length) {
      continue;
    }

    if (attributeCode === "price") {
      const firstRange = values[0];
      const [from, to] = firstRange.split("_");
      if (from || to) {
        input.price = {
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        };
      }
      continue;
    }

    if (attributeCode === "category_uid") {
      input.category_uid = { in: values };
      continue;
    }

    if (attributeCode === "category_id") {
      input.category_id = { in: values };
      continue;
    }

    input[attributeCode] = { in: values };
  }

  return input;
}

type ProductListingPageProps = {
  initialCategoryId?: string;
  initialCategoryName?: string;
};

function ProductListingContent({
  initialCategoryId = DEFAULT_CATEGORY_ID,
  initialCategoryName,
}: ProductListingPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() || "";
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const params = useMemo(() => new URLSearchParams(searchParamsString), [searchParamsString]);
  const categoryId = params.get("category_id") || initialCategoryId;
  const sortParam = params.get("sort") || DEFAULT_SORT;
  const selectedSort = SORT_OPTIONS.some(
    (option) => `${option.field}_${option.direction}` === sortParam
  )
    ? sortParam
    : DEFAULT_SORT;
  const viewMode = parseViewMode(params.get("view"));
  const selectedFilters = parseFilters(params);
  const currentPage = parsePositiveNumber(params.get("page"), 1);

  const defaultPageSize = getDefaultPageSize(viewMode);
  const pageSize = parsePositiveNumber(params.get("limit"), defaultPageSize);

  const filtersInput = useMemo(
    () => buildFiltersInput(categoryId, selectedFilters),
    [categoryId, selectedFilters]
  );

  const variables = useMemo(
    () => ({
      filters: filtersInput,
      pageSize,
      currentPage,
      sort: parseSort(selectedSort),
    }),
    [filtersInput, pageSize, currentPage, selectedSort]
  );

  const { data, loading, error } = useQuery<ProductsQueryResult>(PRODUCTS_QUERY, {
    variables,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  const products = data?.products?.items ?? [];
  const aggregations = (data?.products?.aggregations ?? []).filter(
    (aggregation: any): aggregation is ProductAggregation =>
      Boolean(aggregation?.attribute_code && aggregation.options?.length)
  );
  const totalCount = data?.products?.total_count ?? 0;
  const totalPages = data?.products?.page_info?.total_pages ?? 1;
  const activePage = data?.products?.page_info?.current_page ?? currentPage;

  const showingFrom = totalCount === 0 ? 0 : (activePage - 1) * pageSize + 1;
  const showingTo = totalCount === 0 ? 0 : Math.min(activePage * pageSize, totalCount);

  const isSidebarVisible = isDesktopSidebarOpen;

  const updateUrl = (updater: (nextParams: URLSearchParams) => void) => {
    const nextParams = new URLSearchParams(searchParamsString);
    updater(nextParams);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  const onToggleFilter = (attributeCode: string, value: string) => {
    updateUrl((nextParams) => {
      const current = nextParams.getAll(attributeCode);
      const hasValue = current.includes(value);
      const values =
        attributeCode === "price"
          ? hasValue
            ? []
            : [value]
          : hasValue
            ? current.filter((item) => item !== value)
            : [...current, value];

      nextParams.delete(attributeCode);
      values.forEach((item) => nextParams.append(attributeCode, item));
      nextParams.set("page", "1");
    });

    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  const onClearFilters = () => {
    updateUrl((nextParams) => {
      for (const key of Array.from(nextParams.keys())) {
        if (!RESERVED_PARAMS.has(key)) {
          nextParams.delete(key);
        }
      }
      nextParams.set("page", "1");
    });

    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
      setIsDesktopSidebarOpen((open) => !open);
      return;
    }

    setIsMobileSidebarOpen((open) => !open);
  };

  const filterSidebar = (
    <FilterSidebar
      aggregations={aggregations}
      selectedFilters={selectedFilters}
      onToggleFilter={onToggleFilter}
      onClearFilters={onClearFilters}
    />
  );

  if (error) {
    return <div className="container py-10 text-red-600">Error loading products: {error.message}</div>;
  }

  return (
    <>
      {initialCategoryName ? (
        <div
          className="category-header relative mb-0 min-h-24 before:pointer-events-none before:absolute before:inset-0 before:z-0 before:h-full before:w-full before:bg-[linear-gradient(269.93deg,#0000_1.09%,#0006_50.42%,#000000b3_98.54%)] before:content-['']"
        >
          <h1 className="page-title title-font absolute top-1/2 left-1/2 z-10 m-0 w-full -translate-x-1/2 -translate-y-1/2 py-3 text-left text-2xl font-bold text-white min-[1440px]:max-w-[1440px] min-[1440px]:px-5 md:text-4xl">
            <span className="base" data-ui-id="page-title-wrapper">
              {initialCategoryName}
            </span>
          </h1>
        </div>
      ) : null}

      <div className="container pt-6 pb-10">
        {isMobileSidebarOpen ? (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button
              type="button"
              aria-label="Close filters"
              className="absolute inset-0 bg-black/30 transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />

            <aside className="relative z-[61] h-full w-full md:w-[min(500px,90vw)] overflow-y-auto bg-[#f4f4f4] shadow-lg transition-transform duration-300 ease-in-out">
              <div className="flex justify-between items-center
             text-base font-bold shadow-soft px-4 py-3 border-b border-gray-300 bg-white">
                <h2 className="m-0 uppercase">Filters</h2>
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex h-8 w-8 items-center justify-center text-[#ff003c] cursor-pointer"
                  aria-label="Close filters"
                >
                  <CloseIcon size={20} />
                </button>
              </div>
              {filterSidebar}
            </aside>
          </div>
        ) : null}

        <div
          className={`flex items-start transition-[gap] duration-300 ease-in-out ${isDesktopSidebarOpen ? "lg:gap-6" : "gap-0"}`}
        >
          <aside
            className="hidden shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out lg:block"
            style={{
              width: isDesktopSidebarOpen ? SIDEBAR_WIDTH_PX : 0,
              opacity: isDesktopSidebarOpen ? 1 : 0,
            }}
            aria-hidden={!isDesktopSidebarOpen}
          >
            <div style={{ width: SIDEBAR_WIDTH_PX }}>{filterSidebar}</div>
          </aside>

          <section className="@container min-w-0 flex-1 transition-[margin] duration-300 ease-in-out">
            <SortBar
              showingFrom={showingFrom}
              showingTo={showingTo}
              totalCount={totalCount}
              selectedSort={selectedSort}
              sortOptions={SORT_OPTIONS}
              viewMode={viewMode}
              pageSize={pageSize}
              isSidebarOpen={isSidebarVisible || isMobileSidebarOpen}
              onToggleSidebar={handleToggleSidebar}
              onChangeSort={(sortValue) =>
                updateUrl((nextParams) => {
                  nextParams.set("sort", sortValue);
                  nextParams.set("page", "1");
                })
              }
              onChangeViewMode={(mode) =>
                updateUrl((nextParams) => {
                  nextParams.set("view", mode);
                  nextParams.set("limit", String(getDefaultPageSize(mode)));
                  nextParams.set("page", "1");
                })
              }
              onChangePageSize={(size) =>
                updateUrl((nextParams) => {
                  nextParams.set("limit", String(size));
                  nextParams.set("page", "1");
                })
              }
            />

            {loading && !data ? (
              <CommonLoader />
            ) : products.length ? (
              <>
                {viewMode === "grid" ? (
                  <ProductGrid
                    products={products}
                    isSidebarOpen={isDesktopSidebarOpen}
                  />
                ) : viewMode === "list" ? (
                  <ProductList products={products} />
                ) : (
                  <ProductTable products={products} />
                )}
                <Pagination
                  currentPage={Number(activePage) || currentPage}
                  totalPages={totalPages}
                  onPageChange={(nextPage) =>
                    updateUrl((nextParams) => {
                      nextParams.set("page", String(nextPage));
                    })
                  }
                />
              </>
            ) : (
              <div className="rounded border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
                No products found for selected filters.
              </div>
            )}
          </section>
        </div>
        </div>
    </>
  );
}

export default function ProductListingPage({
  initialCategoryId,
  initialCategoryName,
}: ProductListingPageProps) {
  const client = getBrowserApolloClient();

  return (
    <ApolloProvider client={client}>
      <ProductListingContent
        initialCategoryId={initialCategoryId}
        initialCategoryName={initialCategoryName}
      />
    </ApolloProvider>
  );
}
