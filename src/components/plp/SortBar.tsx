"use client";

import { FilterSlidersIcon, GridSvgIcon, ListSvgIcon, TableSvgIcon } from "@/components/Icon";
import type { SortOption, ViewMode } from "./types";

type SortBarProps = {
  showingFrom: number;
  showingTo: number;
  totalCount: number;
  selectedSort: string;
  sortOptions: SortOption[];
  viewMode: ViewMode;
  pageSize: number;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onChangeSort: (sortValue: string) => void;
  onChangeViewMode: (mode: ViewMode) => void;
  onChangePageSize: (size: number) => void;
};

export default function SortBar({
  showingFrom,
  showingTo,
  totalCount,
  selectedSort,
  sortOptions,
  viewMode,
  pageSize,
  isSidebarOpen,
  onToggleSidebar,
  onChangeSort,
  onChangeViewMode,
  onChangePageSize,
}: SortBarProps) {
  const showOptions =
    viewMode === "grid" ? [12, 24, 36] : viewMode === "list" ? [10, 20, 30] : [5, 10, 20];

  return (
    <div className="mb-4 lg:mb-8 flex flex-wrap items-start lg:items-center gap-x-4 gap-y-3">
      <div className="flex min-w-0 flex-1 items-center gap-2 flex-wrap lg:flex-nowrap">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Hide filters" : "Show filters"}
          aria-expanded={isSidebarOpen}
          className="action-filter flex items-center gap-x-2 w-32 h-10 md:h-11 justify-center sm:w-auto border border-solid border-[#d2d2d2] py-2 px-4 md:p-2 hover:text-white hover:bg-[#F50028] text-[#F50028] max-w-[105px]"
        >
          <FilterSlidersIcon size={24} />
          <span className="block lg:hidden">Filters</span>
        </button>

        <p className="text-sm font-semibold">
          {totalCount > 0 ? (
            <>
              Showing <span className="font-medium">{showingFrom}</span>-
              <span className="font-medium">{showingTo}</span> of{" "}
              <span className="font-medium">{totalCount}</span> products
            </>
          ) : (
            "No products found"
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 md:gap-x-4 lg:gap-x-7">
        <label className="hidden lg:flex items-center gap-1 text-sm font-semibold">
          <span className="shrink-0">Show:</span>
          <select
            value={pageSize}
            onChange={(event) => onChangePageSize(Number(event.target.value))}
            className="select-common min-w-16 text-gray-900"
          >
            {showOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1 text-sm font-semibold">
          <span className="shrink-0 hidden lg:block">Sort By:</span>
          <select
            value={selectedSort}
            onChange={(event) => onChangeSort(event.target.value)}
            className="select-common min-w-32 text-gray-900"
          >
            {sortOptions.map((option) => (
              <option key={`${option.field}_${option.direction}`} value={`${option.field}_${option.direction}`}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="lg:flex hidden items-center overflow-hidden border border-gray-300">
          <button
            type="button"
            className={`p-2 items-center cursor-pointer justify-center flex w-11 aspect-square ${viewMode === "grid" ? "bg-[#ff003c] text-white" : ""}`}
            onClick={() => onChangeViewMode("grid")}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
          >
            <GridSvgIcon size={22} />
          </button>
          <button
            type="button"
            className={`border-x border-gray-300 p-2 items-center cursor-pointer justify-center flex w-11 aspect-square ${viewMode === "list" ? "bg-[#ff003c] text-white" : ""}`}
            onClick={() => onChangeViewMode("list")}
            aria-label="List view"
            aria-pressed={viewMode === "list"}
          >
            <ListSvgIcon size={22} />
          </button>
          <button
            type="button"
            className={`p-2 items-center cursor-pointer justify-center flex w-11 aspect-square ${viewMode === "table" ? "bg-[#ff003c] text-white" : ""}`}
            onClick={() => onChangeViewMode("table")}
            aria-label="Table view"
            aria-pressed={viewMode === "table"}
          >
            <TableSvgIcon size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
