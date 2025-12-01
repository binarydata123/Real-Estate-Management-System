"use client";

import React, { useEffect, useCallback, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

interface ScrollPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
  threshold?: number; // Distance from bottom to trigger load (0-1)
  className?: string;
}

const ScrollPagination: React.FC<ScrollPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  hasMore = true,
  loader,
  endMessage,
  threshold = 0.8, // Load when 80% of the page is scrolled
  className = "",
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(true);

  // Default loader component
  const defaultLoader = (
    <div className="flex justify-center items-center py-8">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600 text-sm">Loading more...</span>
      </div>
    </div>
  );

  // Default end message
  const defaultEndMessage = (
    <div
      className="
      text-center py-10 text-gray-500 text-sm 
      animate-fadeIn
    "
    >
      {/* Divider */}
      🎉 You’re all caught up!
    </div>
  );

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (
        entry.isIntersecting &&
        hasMore &&
        !isLoading &&
        currentPage < totalPages
      ) {
        onPageChange(currentPage + 1);
      }
    },
    [currentPage, totalPages, hasMore, isLoading, onPageChange]
  );

  // Effect for showing/hiding the "Back to Top" button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: threshold,
    };

    observerRef.current = new IntersectionObserver(handleIntersection, options);

    if (triggerRef.current) {
      observerRef.current.observe(triggerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold]);

  if (!hasMore && currentPage >= totalPages) {
    return <div className={className}>{endMessage || defaultEndMessage}</div>;
  }

  return (
    <div className={className}>
      {/* Invisible trigger element */}
      <div ref={triggerRef} className="h-1" />

      {/* Loader */}
      {isLoading && (loader || defaultLoader)}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-28 right-6 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary transition-all duration-300 z-50"
          aria-label="Go to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default ScrollPagination;
