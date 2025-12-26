import React, { useState } from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { LucideChevronDown, LucideChevronUp } from "lucide-react";

interface Filters {
  type: string;
  category: string;
  unit_area_type: string;
  facing: string;
  is_corner_plot: string;
  plot_dimension_unit: string;
  rera_status: string;
  transaction_type: string;
}

interface PropertyFiltersProps {
  onFilterChange: (filters: Filters) => void;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  onFilterChange,
}) => {
  const [filters, setFilters] = useState<Filters>({
    type: "",
    category: "",
    unit_area_type: "",
    facing: "",
    is_corner_plot: "",
    plot_dimension_unit: "",
    rera_status: "",
    transaction_type: "",
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
      type: "",
      category: "",
      unit_area_type: "",
      facing: "",
      is_corner_plot: "",
      plot_dimension_unit: "",
      rera_status: "",
      transaction_type: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-1 md:p-6 mb-2 md:mb-6">
      <div
        className="flex items-center justify-between md:mb-4"
        onClick={handleFilterToggle}
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filter Properties
        </h3>
        <div className="flex items-center">
          {Object.values(filters).some((value) => value !== "") && (
            <span
              onClick={handleReset}
              className="cursor-pointer text-sm text-primary hover:text-primary"
            >
              Reset All
            </span>
          )}
          <button
            // onClick={handleFilterToggle}
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
        className={`${showFilter ? "grid" : "hidden"
          } md:grid grid-cols-2 md:grid-cols-8 gap-2 md:gap-4 mt-2 text-black`}
      >
        {/* Property Type */}
        <div>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="w-full px-[11px] py-[11px] border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
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
            className="w-full px-[11px] py-[11px] border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">All Categories</option>
            <option value="plot">Plot</option>
            <option value="flat">Flat</option>
            <option value="villa">Villa</option>
            <option value="showroom">Showroom</option>
            <option value="office">Office</option>
            <option value="land">Land</option>
            <option value="farmhouse">Farm House</option>
          </select>
        </div>
        {/* Area Unit */}
        <div>
          <select
            value={filters.unit_area_type}
            onChange={(e) =>
              handleFilterChange("unit_area_type", e.target.value)
            }
            className="w-full px-[11px] py-[11px] border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">All Units</option>
            <option value="square feet">Square Feet</option>
            <option value="square meter">Square Meter</option>
            <option value="square yard">Square Yard</option>
            <option value="acre">Acre</option>
            <option value="gaj">Gaj</option>
            <option value="hectare">Hectare</option>
            <option value="bigha">Bigha</option>
            <option value="kanal">Kanal</option>
            <option value="marla">Marla</option>
          </select>
        </div>
        {/* Facing */}
        <div>
          <select
            value={filters.facing}
            onChange={(e) => handleFilterChange("facing", e.target.value)}
            className="w-full px-[11px] py-[11px] border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">Any Facing</option>
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="east">East</option>
            <option value="west">West</option>
            <option value="north east">North-East</option>
            <option value="north west">North-West</option>
            <option value="south east">South-East</option>
            <option value="south west">South-West</option>
          </select>
        </div>
        {/* Corner Plot */}
        <div>
          <select
            value={filters.is_corner_plot}
            onChange={(e) =>
              handleFilterChange("is_corner_plot", e.target.value)
            }
            className="w-full px-[11px] py-[11px] border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">Corner Plot?</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        {/* Dimension Unit */}
        <div>
          <select
            value={filters.plot_dimension_unit}
            onChange={(e) =>
              handleFilterChange("plot_dimension_unit", e.target.value)
            }
            className="w-full px-[11px] py-[11px] border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">Dimension Unit</option>
            <option value="feet">Feet</option>
            <option value="meter">Meter</option>
          </select>
        </div>
        {/* RERA Status */}
        <div>
          <select
            value={filters.rera_status}
            onChange={(e) => handleFilterChange("rera_status", e.target.value)}
            className="w-full px-[11px] py-[11px] border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">RERA Status</option>
            <option value="approved">Approved</option>
            <option value="not approved">Not Approved</option>
            <option value="applied">Applied</option>
          </select>
        </div>
        {/* Transaction Type */}
        <div>
          <select
            value={filters.transaction_type}
            onChange={(e) =>
              handleFilterChange("transaction_type", e.target.value)
            }
            className="w-full px-[11px] py-[11px] border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">Transaction</option>
            <option value="new">New</option>
            <option value="resale">Resale</option>
          </select>
        </div>
      </div>
    </div>
  );
};
