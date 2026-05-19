import type {
  ConfigurableOption,
  ConfigurableOptionValue,
  ConfigurableVariant,
  ProductItem,
} from "@/framework/graphql/queries/products";

export type AddToCartItemInput = {
  sku: string;
  quantity?: number;
  parentSku?: string;
  selectedOptions?: string[];
};

export type ProductDisplayImage = {
  url: string;
  label: string;
};

export type OptionSwatchType = "color" | "image" | "text";

const SELECTED_SWATCH_CLASS = "ring-2 ring-[#F50028] ring-offset-1";

export function getSelectedSwatchClass(isSelected: boolean): string {
  return isSelected ? SELECTED_SWATCH_CLASS : "";
}

export function isConfigurableProduct(
  product: ProductItem,
): product is ProductItem & { configurable_options: ConfigurableOption[] } {
  return (
    product.__typename === "ConfigurableProduct" &&
    Array.isArray(product.configurable_options) &&
    product.configurable_options.length > 0
  );
}

export function sortConfigurableOptions(
  options: ConfigurableOption[],
): ConfigurableOption[] {
  return [...options].sort((left, right) => {
    const leftIsText = getOptionSwatchType(left) === "text" ? 0 : 1;
    const rightIsText = getOptionSwatchType(right) === "text" ? 0 : 1;
    return leftIsText - rightIsText;
  });
}

export function getOptionSwatchType(option: ConfigurableOption): OptionSwatchType {
  const firstValue = option.values?.[0];
  if (!firstValue) {
    return isColorAttributeCode(option.attribute_code) ? "color" : "text";
  }

  const swatchType = getValueSwatchType(firstValue);
  if (swatchType !== "text") {
    return swatchType;
  }

  return isColorAttributeCode(option.attribute_code) ? "color" : "text";
}

export function getValueSwatchType(value: ConfigurableOptionValue): OptionSwatchType {
  const typename = value.swatch_data?.__typename;

  if (typename === "ColorSwatchData") {
    return "color";
  }

  if (typename === "ImageSwatchData") {
    return "image";
  }

  return "text";
}

export function getSwatchColor(value: ConfigurableOptionValue): string | null {
  const swatchValue = value.swatch_data?.value?.trim();
  if (!swatchValue) {
    return null;
  }

  if (getValueSwatchType(value) === "color") {
    return swatchValue.startsWith("#") ? swatchValue : `#${swatchValue}`;
  }

  return null;
}

export function getSwatchImageUrl(value: ConfigurableOptionValue): string | null {
  if (getValueSwatchType(value) !== "image") {
    return null;
  }

  return value.swatch_data?.thumbnail?.trim() || value.swatch_data?.value?.trim() || null;
}

function isColorAttributeCode(attributeCode?: string | null): boolean {
  return attributeCode?.toLowerCase().includes("color") ?? false;
}

export function areAllConfigurableOptionsSelected(
  product: ProductItem,
  selections: Record<string, string>,
): boolean {
  if (!isConfigurableProduct(product)) {
    return true;
  }

  return product.configurable_options.every(
    (option) => Boolean(selections[option.uid]?.trim()),
  );
}

export function getSelectedOptionValueUids(
  product: ProductItem,
  selections: Record<string, string>,
): string[] {
  if (!isConfigurableProduct(product)) {
    return [];
  }

  return product.configurable_options
    .map((option) => selections[option.uid]?.trim())
    .filter((valueUid): valueUid is string => Boolean(valueUid));
}

export function findVariant(
  product: ProductItem,
  selections: Record<string, string>,
): ConfigurableVariant | null {
  if (!isConfigurableProduct(product)) {
    return null;
  }

  if (!areAllConfigurableOptionsSelected(product, selections)) {
    return null;
  }

  const selectedByAttributeCode = new Map<string, number>();

  for (const option of product.configurable_options) {
    const valueUid = selections[option.uid]?.trim();
    const value = option.values?.find((entry) => entry.uid === valueUid);

    if (!value || typeof value.value_index !== "number") {
      return null;
    }

    const attributeCode = option.attribute_code?.trim();
    if (!attributeCode) {
      return null;
    }

    selectedByAttributeCode.set(attributeCode, value.value_index);
  }

  const match = product.variants?.find((variant) => {
    const attributes = variant.attributes ?? [];
    if (attributes.length !== product.configurable_options.length) {
      return false;
    }

    return attributes.every((attribute) => {
      const selectedValueIndex = selectedByAttributeCode.get(attribute.code);
      return selectedValueIndex === attribute.value_index;
    });
  });

  return match ?? null;
}

export function findVariantSku(
  product: ProductItem,
  selections: Record<string, string>,
): string | null {
  return findVariant(product, selections)?.product?.sku?.trim() ?? null;
}

function getVariantImage(variant: ConfigurableVariant | null): ProductDisplayImage | null {
  const url = variant?.product?.small_image?.url?.trim();
  if (!url) {
    return null;
  }

  return {
    url,
    label: variant?.product?.small_image?.label?.trim() || "Product image",
  };
}

function getBaseImage(product: ProductItem): ProductDisplayImage | null {
  const url = product.small_image?.url?.trim();
  if (!url) {
    return null;
  }

  return {
    url,
    label: product.small_image?.label?.trim() || product.name,
  };
}

function findVariantImageForOptionValue(
  product: ProductItem,
  option: ConfigurableOption,
  valueUid: string,
): ProductDisplayImage | null {
  if (!isConfigurableProduct(product)) {
    return null;
  }

  const value = option.values?.find((entry) => entry.uid === valueUid);
  if (!value || typeof value.value_index !== "number") {
    return null;
  }

  const attributeCode = option.attribute_code?.trim();
  if (!attributeCode) {
    return null;
  }

  const match = product.variants?.find((variant) =>
    variant.attributes?.some(
      (attribute) =>
        attribute.code === attributeCode && attribute.value_index === value.value_index,
    ),
  );

  return getVariantImage(match ?? null);
}

export function getDisplayImage(
  product: ProductItem,
  selections: Record<string, string>,
): ProductDisplayImage | null {
  const matchedVariant = findVariant(product, selections);
  const variantImage = getVariantImage(matchedVariant);
  if (variantImage) {
    return variantImage;
  }

  if (!isConfigurableProduct(product)) {
    return getBaseImage(product);
  }

  const visualOption = product.configurable_options.find((option) => {
    const swatchType = getOptionSwatchType(option);
    return swatchType === "color" || swatchType === "image";
  });

  if (visualOption) {
    const selectedValueUid = selections[visualOption.uid]?.trim();
    if (selectedValueUid) {
      const partialImage = findVariantImageForOptionValue(
        product,
        visualOption,
        selectedValueUid,
      );
      if (partialImage) {
        return partialImage;
      }
    }
  }

  return getBaseImage(product);
}

export function buildAddToCartInput(
  product: ProductItem,
  selections: Record<string, string>,
): AddToCartItemInput {
  if (!isConfigurableProduct(product)) {
    return {
      sku: product.sku,
      quantity: 1,
    };
  }

  if (!areAllConfigurableOptionsSelected(product, selections)) {
    throw new Error("Please select all required options.");
  }

  const selectedOptions = getSelectedOptionValueUids(product, selections);

  if (!findVariantSku(product, selections)) {
    throw new Error("Selected combination is not available.");
  }

  return {
    sku: product.sku,
    parentSku: product.sku,
    selectedOptions,
    quantity: 1,
  };
}
