"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BuildingOfficeIcon, PlusIcon } from "@heroicons/react/24/outline";
import { PropertyFilters } from "./PropertyFilters";
import { AddPropertyForm } from "./AddPropertyForm";
import PropertyDetailModal from "../Common/PropertyDetailModal";
import SharePropertyModal from "../Common/SharePropertyModal";
import { PropertyCard } from "./PropertyCard";
import { getProperties } from "@/lib/Agent/PropertyAPI";
import { useDebounce } from "@/components/Common/UseDebounce";
import { Pagination } from "@/components/Common/Pagination";

export const Properties: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [showShareModal, setShowShareModal] = useState(false);
  const [propertyToShare, setPropertyToShare] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [filters, setFilters] = useState<any>({});

  const debouncedFilters = useDebounce(filters, 700);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const getAllProperties = useCallback(
    async (page = 1) => {
      try {
        const response = await getProperties({
          ...debouncedFilters,
          page,
          limit,
        });

        if (response.success) {
          setProperties(response.data);
          setCurrentPage(response.pagination?.page ?? 1);
          setTotalPages(response.pagination?.pages ?? 1);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [debouncedFilters]
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
          <span className="flex items-center md:px-4 px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Property
          </span>
        </Link>
      </div>

      {/* Filters */}
      <PropertyFilters
        onFilterChange={(newFilters) => setFilters(newFilters)}
      />

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property._id}
            property={property}
            onView={handleViewProperty}
            onShare={handleShareProperty}
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

      {properties.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No properties yet
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by adding your first property listing
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Your First Property
          </button>
        </div>
      )}

      {/* Add Property Modal */}
      {showAddForm && <AddPropertyForm />}

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
