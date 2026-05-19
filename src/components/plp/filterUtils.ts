import type { ProductAggregation } from "@/framework/graphql";
import type { FilterSelection } from "./types";

export type AppliedFilter = {
  attributeCode: string;
  value: string;
  label: string;
};

function formatPriceRangeLabel(from?: string, to?: string) {
  const format = (raw: string) => {
    const amount = Number(raw);
    if (!Number.isFinite(amount)) {
      return raw;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (from && to) {
    return `${format(from)} - ${format(to)}`;
  }
  if (from) {
    return `${format(from)}+`;
  }
  if (to) {
    return `Up to ${format(to)}`;
  }
  return "";
}

export function getAppliedFilters(
  selectedFilters: FilterSelection,
  aggregations: ProductAggregation[]
): AppliedFilter[] {
  const applied: AppliedFilter[] = [];

  for (const [attributeCode, values] of Object.entries(selectedFilters)) {
    if (!values.length) {
      continue;
    }

    const aggregation = aggregations.find((item) => item.attribute_code === attributeCode);

    for (const value of values) {
      const option = aggregation?.options.find((item) => item.value === value);
      let label = option?.label ?? value;

      if (attributeCode === "price" && !option) {
        const [from, to] = value.split("_");
        label = formatPriceRangeLabel(from, to) || value;
      }

      applied.push({ attributeCode, value, label });
    }
  }

  return applied;
}

export function hasAppliedFilters(selectedFilters: FilterSelection) {
  return Object.values(selectedFilters).some((values) => values.length > 0);
}
