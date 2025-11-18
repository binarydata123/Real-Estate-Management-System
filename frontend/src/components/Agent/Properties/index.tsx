"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BuildingOfficeIcon, PlusIcon } from "@heroicons/react/24/outline";
import { PropertyFilters } from "./PropertyFilters";
import PropertyDetailModal from "../Common/PropertyDetailModal";
import SharePropertyModal from "../Common/SharePropertyModal";
import { PropertyCard } from "./PropertyCard";
import { getProperties } from "@/lib/Agent/PropertyAPI";
import { useDebounce } from "@/components/Common/UseDebounce";
import { Pagination } from "@/components/Common/Pagination";
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
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
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
    async (page = 1) => {
      try {
        setIsFetching(true);
        const activeFilters = Object.fromEntries(
          Object.entries(debouncedFilters).filter(([, value]) => value !== ""),
        );

        const response = await getProperties({
          ...activeFilters,
          page: String(page),
          limit,
        });

        if (response.success) {
          setProperties(response.data);
          setCurrentPage(response.pagination?.page ?? 1);
          setTotalPages(response.pagination?.pages ?? 1);
        }
      } catch (error) {
      showErrorToast("Error",error);
      } finally {
        setIsFetching(false);
      }
    },
    [debouncedFilters, limit],
  );

  useEffect(() => {
    setCurrentPage(1); // reset to first page when filters change
    getAllProperties(1);
  }, [debouncedFilters, getAllProperties]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      getAllProperties(page);
    }
  };

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleShareProperty = (property: Property) => {
    setPropertyToShare(property);
    setShowShareModal(true);
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
        <Link href="/agent/add-property">
          <span className="flex items-center md:px-4 px-2 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors cursor-pointer">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Property
          </span>
        </Link>
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
                onView={handleViewProperty}
                onShare={handleShareProperty}
                onRefresh={getAllProperties}
              />
            ))}
          </div>

          {/* Pagination outside the grid */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                siblingCount={1}
                showFirstLast={true}
                showPrevNext={true}
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

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onShare={(property) => {
            setSelectedProperty(null);
            handleShareProperty(property);
          }}
        />
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
