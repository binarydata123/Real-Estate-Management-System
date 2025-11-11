"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number; // Number of pages to show on each side of current
  showFirstLast?: boolean; // Show first/last buttons
  showPrevNext?: boolean; // Show prev/next buttons
}

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showPrevNext = true,
}) => {
  if (totalPages <= 1) return null;

  const paginationRange = () => {
    const totalPageNumbers = siblingCount * 2 + 5; // 5: current + first + last + 2 dots
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    const pages: (number | string)[] = [];

    if (!showLeftDots && showRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      pages.push(...leftRange, "...", totalPages);
    } else if (showLeftDots && !showRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      pages.push(1, "...", ...rightRange);
    } else if (showLeftDots && showRightDots) {
      pages.push(
        1,
        "...",
        ...range(leftSiblingIndex, rightSiblingIndex),
        "...",
        totalPages,
      );
    }

    return pages;
  };

  const pages = paginationRange();

  return (
    <div className="flex flex-wrap justify-center items-center space-x-1 sm:space-x-2 mt-4 mb-4 pagination-button-sec">
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-2 sm:px-3 py-1 rounded-full hover:bg-gray-200 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {"<<"}
        </button>
      )}

      {showPrevNext && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 sm:px-3 py-1 rounded-full hover:bg-gray-200 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          <span className="sm:hidden">&lt;</span>
          <span className="hidden sm:inline">Previous</span>
        </button>
      )}

      {pages.map((page, idx) =>
        typeof page === "number" ? (
          <button
            key={idx}
            onClick={() => onPageChange(page)}
            className={`px-3 sm:px-4 py-1 rounded-full transition-all duration-300 transform text-sm sm:text-base ${
              page === currentPage
                ? "bg-blue-500 text-white shadow-xl scale-110"
                : "bg-white text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:scale-105 shadow-md"
            }`}
          >
            {page}
          </button>
        ) : (
          <span
            key={idx}
            className="px-2 sm:px-3 py-1 text-gray-400 select-none text-sm sm:text-base"
          >
            {page}
          </span>
        ),
      )}

      {showPrevNext && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 sm:px-3 py-1 rounded-full hover:bg-gray-200 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          <span className="sm:hidden">&gt;</span>
          <span className="hidden sm:inline">Next</span>
        </button>
      )}

      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2 sm:px-3 py-1 rounded-full hover:bg-gray-200 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {">>"}
        </button>
      )}
    </div>
  );
};
