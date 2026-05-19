"use client";

type CommonLoaderProps = {
  text?: string;
  className?: string;
};

export default function CommonLoader({
  text = "Loading products...",
  className = "",
}: CommonLoaderProps) {
  return (
    <div className={`flex min-h-56 items-center justify-center rounded border border-gray-200 bg-white ${className}`}>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
        <span>{text}</span>
      </div>
    </div>
  );
}
