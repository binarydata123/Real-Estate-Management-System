"use client";

import React, { useCallback, useEffect, useState } from "react";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { PropertyFilters } from "./PropertyFilters";
import { PropertyCard } from "./PropertyCard";
import { getProperties } from "@/lib/Customer/PropertyAPI";
import { useDebounce } from "@/components/Common/UseDebounce";
import ScrollPagination from "@/components/Common/ScrollPagination";
import { useAuth } from "@/context/AuthContext";
import { showErrorToast } from "@/utils/toastHandler";

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
    <div className="bg-gray-200 md:aspect-[4/3] aspect-[17/9]"></div>
    <div className="md:p-4 p-2">
      <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded"></div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200 flex space-x-2">
        <div className="h-9 bg-gray-300 rounded-lg flex-1"></div>
        <div className="h-9 w-10 bg-gray-300 rounded-lg"></div>
        <div className="h-9 w-10 bg-gray-300 rounded-lg"></div>
        <div className="h-9 w-10 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  </div>
);

export const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState<Partial<PropertyListFilters>>({});
  const [isFetching, setIsFetching] = useState(true);
  const debouncedFilters = useDebounce(filters, 700);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const { user } = useAuth();
  let customerId = "";
  let agencyId = "";
  if (user?.showAllProperty === false) {
    customerId = String(user?._id);
    agencyId = "";
  } else {
    customerId = "";
    agencyId = String(user?.agency?._id);
  }

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
          customerId: customerId,
          agencyId: agencyId,
        });

        if (response.success) {
          setProperties((prev) =>
            append ? [...prev, ...response.data] : response.data
          );
          setCurrentPage(response.pagination?.page ?? 1);
          setTotalPages(response.pagination?.pages ?? 1);
        }
      } catch (error) {
        showErrorToast("Error:", error);
      } finally {
        setIsFetching(false);
      }
    },
    [debouncedFilters, limit, customerId, agencyId]
  );

  useEffect(() => {
    setProperties([]); // Clear properties when filters change
    getAllProperties(1);
  }, [debouncedFilters, getAllProperties]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      getAllProperties(page, true);
    }
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 md:mt-1 hidden md:block">
            Manage your property listings
          </p>
        </div>
      </div>

      {/* Filters */}
      <PropertyFilters
        onFilterChange={(newFilters) => setFilters(newFilters)}
      />

      {isFetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))}
        </div>
      ) : properties.length > 0 ? (
        <>
          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onRefresh={getAllProperties}
              />
            ))}
          </div>

          {/* Pagination outside the grid */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <ScrollPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                hasMore={currentPage < totalPages}
                loader={
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                }
                endMessage={
                  <div className="text-center py-8 text-green-600 font-medium">
                    🎉 All caught up!
                  </div>
                }
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No properties found
          </h3>
          <p className="text-gray-500 mb-6">
            Try adjusting your filters or add a new property.
          </p>
        </div>
      )}
    </div>
  );
};
