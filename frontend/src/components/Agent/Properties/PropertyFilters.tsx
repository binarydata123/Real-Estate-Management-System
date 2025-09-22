import React, { useState } from "react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { LucideChevronDown, LucideChevronUp } from "lucide-react";

interface Filters {
  title: string;
  type: string;
  category: string;
  status: string;
  minPrice: string;
  maxPrice: string;
}

interface PropertyFiltersProps {
  onFilterChange: (filters: Filters) => void;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  onFilterChange,
}) => {
  const [filters, setFilters] = useState<Filters>({
    title: "",
    type: "",
    category: "",
    status: "",
    minPrice: "",
    maxPrice: "",
  });

  const [showFilter, setShowFilter] = useState(false);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFilterToggle = () => {
    setShowFilter((prev) => !prev);
  };

  const handleReset = () => {
    const resetFilters: Filters = {
      title: "",
      type: "",
      category: "",
      status: "",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-1 md:p-6 mb-2 md:mb-6">
      <div className="flex items-center justify-between md:mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filter Properties
        </h3>
        <div className="flex items-center">
          {Object.values(filters).some((value) => value !== "") && (
            <span
              onClick={handleReset}
              className="cursor-pointer text-sm text-blue-600 hover:text-blue-700"
            >
              Reset All
            </span>
          )}
          <button
            onClick={handleFilterToggle}
            className="ml-4 p-1 text-gray-500 hover:text-gray-900 focus:outline-none md:hidden"
          >
            <span className="sr-only">Toggle Filters</span>
            {showFilter ? (
              <LucideChevronUp className="h-6 w-6" />
            ) : (
              <LucideChevronDown className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`${
          showFilter ? "grid" : "hidden"
        } md:grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-2 md:gap-4 mt-2`}
      >
        {/* Search */}
        <div className="lg:col-span-2">
          <div className="relative">
            <MagnifyingGlassIcon className="hidden md:block absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={filters.title}
              onChange={(e) => handleFilterChange("title", e.target.value)}
              className="w-full pl-1 md:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Property Type */}
        <div>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="w-full px-[11px] py-[11px] border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-full px-[11px] py-[11px] border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option value="plot">Plot</option>
            <option value="flat">Flat</option>
            <option value="villa">Villa</option>
            <option value="showroom">Showroom</option>
            <option value="office">Office</option>
            <option value="land">Land</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-[11px] py-[11px] border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {" "}
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
            <option value="Rented">Rented</option>
            <option value="Pending">Pending</option>
            <option value="off_market">Off Market</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="lg:col-span-1 col-span-2 flex space-x-2">
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
