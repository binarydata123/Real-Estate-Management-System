"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BuildingOfficeIcon, PlusIcon } from "@heroicons/react/24/outline";
import { PropertyFilters } from "./PropertyFilters";
import SharePropertyModal from "../Common/SharePropertyModal";
import { PropertyCard } from "./PropertyCard";
import { getProperties } from "@/lib/Agent/PropertyAPI";
import { useDebounce } from "@/components/Common/UseDebounce";
import { showErrorToast } from "@/utils/toastHandler";
import ScrollPagination from "@/components/Common/ScrollPagination";

interface PropertyListFilters {
  type: string;
  category: string;
  unit_area_type: string;
  facing: string;
  is_corner_plot: string;
  plot_dimension_unit: string;
  rera_status: string;
  transaction_type: string;
}

const PropertyCardSkeleton = () => (
  <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <div className="bg-gray-200 aspect-[16/10] md:aspect-[4/3]"></div>
    <div className="p-3 md:p-4">
      <div className="h-4 md:h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 md:h-5 bg-gray-300 rounded w-1/3 mb-3"></div>
      <div className="h-3 md:h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="h-3 md:h-4 bg-gray-200 rounded"></div>
        <div className="h-3 md:h-4 bg-gray-200 rounded"></div>
      </div>
      <div className="pt-2.5 border-t border-gray-100 flex gap-1.5 md:gap-2">
        <div className="h-9 md:h-10 bg-gray-300 rounded-lg flex-1"></div>
        <div className="h-9 md:h-10 w-9 md:w-10 bg-gray-300 rounded-lg"></div>
        <div className="h-9 md:h-10 w-9 md:w-10 bg-gray-300 rounded-lg"></div>
        <div className="h-9 md:h-10 w-9 md:w-10 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  </div>
);

export const Properties: React.FC = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [propertyToShare, setPropertyToShare] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState<Partial<PropertyListFilters>>({});
  const [isFetching, setIsFetching] = useState(true);
  const debouncedFilters = useDebounce(filters, 700);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const getAllProperties = useCallback(
    async (page = 1, append = false) => {
      try {
        setIsFetching(true);
        const activeFilters = Object.fromEntries(
          Object.entries(debouncedFilters).filter(([, value]) => value !== "")
        );

        const response = await getProperties({
          ...activeFilters,
          page: String(page),
          limit,
        });

        if (response.success && response.data) {
          setProperties((prev) =>
            append ? [...prev, ...response.data] : response.data
          );
          setCurrentPage(response.pagination?.page ?? 1);
          setTotalPages(response.pagination?.pages ?? 1);
        }
      } catch (error) {
        showErrorToast("Error", error);
      } finally {
        setIsFetching(false);
      }
    },
    [debouncedFilters, limit]
  );

  useEffect(() => {
    setProperties([]);
    getAllProperties(1);
  }, [debouncedFilters, getAllProperties]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      getAllProperties(page, true);
    }
  };

  const handleShareProperty = (property: Property) => {
    setPropertyToShare(property);
    setShowShareModal(true);
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 truncate">
            Properties
          </h1>
          <p className="text-sm text-gray-600 mt-0.5 md:mt-1 hidden sm:block">
            Manage your property listings
          </p>
        </div>
        <Link href="/agent/add-property" className="flex-shrink-0">
          <span className="flex items-center px-3 md:px-4 py-2 md:py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors cursor-pointer text-sm md:text-base font-medium whitespace-nowrap">
            <PlusIcon className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2" />
            <span className="hidden sm:inline">Add Property</span>
            <span className="sm:hidden">Add</span>
          </span>
        </Link>
      </div>

      {/* Filters */}
      {(properties.length > 0 || Object.values(filters).some((v) => v)) && (
        <PropertyFilters
          onFilterChange={(newFilters) => setFilters(newFilters)}
        />
      )}

      {isFetching && properties.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))}
        </div>
      ) : properties.length > 0 ? (
        <>
          {/* Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onShare={handleShareProperty}
                onRefresh={getAllProperties}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 md:mt-6 flex justify-center">
              <ScrollPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isFetching}
                hasMore={currentPage < totalPages}
                loader={
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-primary"></div>
                  </div>
                }
                endMessage={
                  <div className="text-center py-6 md:py-8 text-green-600 font-medium text-sm md:text-base">
                    All caught up!
                  </div>
                }
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 md:py-12 px-4">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
            <BuildingOfficeIcon className="h-10 w-10 md:h-12 md:w-12 text-gray-400" />
          </div>
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1.5 md:mb-2">
            No properties found
          </h3>
          <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6">
            Try adjusting your filters or add a new property.
          </p>
        </div>
      )}

      {/* Share Property Modal */}
      {showShareModal && propertyToShare && (
        <SharePropertyModal
          property={propertyToShare}
          onClose={() => {
            setShowShareModal(false);
            setPropertyToShare(null);
          }}
        />
      )}
    </div>
  );
};
