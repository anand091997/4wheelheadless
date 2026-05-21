"use client";

import type { ConfigurableOption } from "@/framework/graphql/queries/products";
import {
  getOptionSwatchType,
  getSelectedSwatchClass,
  getSwatchColor,
  getSwatchImageUrl,
} from "@/lib/configurableProduct";

type ConfigurableOptionsProps = {
  options: ConfigurableOption[];
  selections: Record<string, string>;
  onSelectionChange: (optionUid: string, valueUid: string) => void;
  compact?: boolean;
};

function TextSwatchOption({
  option,
  selections,
  onSelectionChange,
  compact,
}: {
  option: ConfigurableOption;
  selections: Record<string, string>;
  onSelectionChange: (optionUid: string, valueUid: string) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap ${compact ? "gap-1.5" : "gap-2"}`}
      role="listbox"
      aria-label={option.label}
    >
      {option.values?.map((value) => {
        const isSelected = selections[option.uid] === value.uid;

        return (
          <button
            key={value.uid}
            type="button"
            role="option"
            aria-selected={isSelected}
            aria-label={`${option.label} ${value.label}`}
            onClick={() => onSelectionChange(option.uid, value.uid)}
            className={`flex min-h-8 min-w-8 items-center justify-center border border-[#d2d2d2] bg-[#f4f4f4] px-2.5 text-xs font-medium text-gray-800 transition-colors hover:border-[#51565b] ${getSelectedSwatchClass(isSelected)}`}
          >
            {value.label}
          </button>
        );
      })}
    </div>
  );
}

function VisualSwatchOption({
  option,
  selections,
  onSelectionChange,
  compact,
}: {
  option: ConfigurableOption;
  selections: Record<string, string>;
  onSelectionChange: (optionUid: string, valueUid: string) => void;
  compact?: boolean;
}) {
  const swatchType = getOptionSwatchType(option);

  return (
    <div
      className={`flex flex-wrap ${compact ? "gap-1.5" : "gap-2"}`}
      role="listbox"
      aria-label={option.label}
    >
      {option.values?.map((value) => {
        const isSelected = selections[option.uid] === value.uid;
        const color = getSwatchColor(value);
        const imageUrl = getSwatchImageUrl(value);

        return (
          <button
            key={value.uid}
            type="button"
            role="option"
            aria-selected={isSelected}
            aria-label={`${option.label} ${value.label}`}
            title={value.label}
            onClick={() => onSelectionChange(option.uid, value.uid)}
            className={`overflow-hidden border border-[#d2d2d2] transition-colors hover:border-[#51565b] ${compact ? "h-7 w-7" : "h-8 w-8"} ${getSelectedSwatchClass(isSelected)}`}
            style={
              swatchType === "color" && color
                ? { backgroundColor: color }
                : undefined
            }
          >
            {swatchType === "image" && imageUrl ? (
              <img
                src={imageUrl}
                alt={value.label}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : swatchType === "color" && !color ? (
              <span className="sr-only">{value.label}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default function ConfigurableOptions({
  options,
  selections,
  onSelectionChange,
  compact = false,
}: ConfigurableOptionsProps) {
  return (
    <div className={`flex flex-col ${compact ? "gap-2" : "gap-3"}`}>
      {options.map((option) => {
        const swatchType = getOptionSwatchType(option);

        return (
          <div key={option.uid} className="min-w-0">
            {swatchType === "text" ? (
              <TextSwatchOption
                option={option}
                selections={selections}
                onSelectionChange={onSelectionChange}
                compact={compact}
              />
            ) : (
              <VisualSwatchOption
                option={option}
                selections={selections}
                onSelectionChange={onSelectionChange}
                compact={compact}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
