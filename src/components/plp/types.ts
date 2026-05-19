import type { ProductAggregation, ProductItem } from "@/framework/graphql";

export type ViewMode = "grid" | "list" | "table";

export type SortOption = {
  label: string;
  field: string;
  direction: "ASC" | "DESC";
};

export const SORT_OPTIONS: SortOption[] = [
  { label: "Position", field: "position", direction: "ASC" },
  { label: "Name A-Z", field: "name", direction: "ASC" },
  { label: "Name Z-A", field: "name", direction: "DESC" },
  { label: "Price Low to High", field: "price", direction: "ASC" },
  { label: "Price High to Low", field: "price", direction: "DESC" },
];

export type FilterSelection = {
  [attributeCode: string]: string[];
};

export type ProductListingData = {
  items: ProductItem[];
  aggregations: ProductAggregation[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
};
