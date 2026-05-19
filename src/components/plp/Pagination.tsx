"use client";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
};

function getPageButtonClass(isActive: boolean) {
  const base =
    "inline-flex h-11 w-11 items-center justify-center border bg-white text-sm transition-colors duration-200 cursor-pointer font-medium";

  if (isActive) {
    return `${base} border-[#F50028] text-[#F50028]`;
  }

  return `${base} border-[#efefef] text-black hover:border-[#F50028] hover:text-[#F50028]`;
}

function getNavButtonClass() {
  return "inline-flex h-11 w-11 items-center justify-center border border-[#efefef] bg-white text-base text-black transition-colors duration-200 hover:border-[#F50028] hover:text-[#F50028] disabled:cursor-not-allowed disabled:hover:border-[#efefef] disabled:hover:text-black cursor-pointer";
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 18l6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const activePage = Number(currentPage) || 1;
  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        disabled={activePage <= 1}
        onClick={() => onPageChange(activePage - 1)}
        className={getNavButtonClass()}
        aria-label="Previous page"
      >
        <ChevronLeftIcon />
      </button>

      {pages.map((page) => {
        const isActive = page === activePage;

        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={isActive ? "page" : undefined}
            className={getPageButtonClass(isActive)}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        disabled={activePage >= totalPages}
        onClick={() => onPageChange(activePage + 1)}
        className={getNavButtonClass()}
        aria-label="Next page"
      >
        <ChevronRightIcon />
      </button>
    </nav>
  );
}
