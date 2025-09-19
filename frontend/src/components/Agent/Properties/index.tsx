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

  // Mock properties data
  //   const properties: Property[] = [
  //     {
  //       id: "1",
  //       title: "Luxury 3BHK Apartment",
  //       type: "residential",
  //       category: "flat",
  //       location: "Bandra West, Mumbai",
  //       price: 7500000,
  //       size: 1200,
  //       size_unit: "sq ft",
  //       bedrooms: 3,
  //       bathrooms: 2,
  //       status: "available",
  //       images: [
  //         "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
  //       ],
  //       created_at: "2025-01-09T10:00:00Z",
  //       description:
  //         "Beautiful 3BHK apartment with modern amenities, spacious rooms, and excellent connectivity. Features include modular kitchen, marble flooring, and 24/7 security.",
  //     },
  //     {
  //       id: "2",
  //       title: "Premium Commercial Office",
  //       type: "commercial",
  //       category: "office",
  //       location: "Andheri East, Mumbai",
  //       price: 12000000,
  //       size: 800,
  //       size_unit: "sq ft",
  //       status: "available",
  //       images: [
  //         "https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg",
  //       ],
  //       created_at: "2025-01-08T14:30:00Z",
  //       description:
  //         "Premium commercial office space in prime location with modern infrastructure, high-speed elevators, and ample parking.",
  //     },
  //     {
  //       id: "3",
  //       title: "Spacious 4BHK Villa",
  //       type: "residential",
  //       category: "villa",
  //       location: "Juhu, Mumbai",
  //       price: 15000000,
  //       size: 2500,
  //       size_unit: "sq ft",
  //       bedrooms: 4,
  //       bathrooms: 3,
  //       status: "sold",
  //       images: [
  //         "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg",
  //       ],
  //       created_at: "2025-01-07T09:15:00Z",
  //       description:
  //         "Luxurious 4BHK villa with private garden, swimming pool, and premium finishes. Perfect for families looking for spacious living.",
  //     },
  //   ];
  const debouncedFilters = useDebounce(filters, 700);
  const getAllProperties = useCallback(async () => {
    try {
      const response = await getProperties(debouncedFilters);
      setProperties(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [debouncedFilters]);

  useEffect(() => {
    getAllProperties();
  }, [getAllProperties]);

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
