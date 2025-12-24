"use client";

import React from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { getPropertyImageUrlWithFallback } from "@/lib/imageUtils";
import Link from "next/link";
import { formatPrice } from "@/utils/helperFunction";
import { FaDirections } from "react-icons/fa";

interface PropertyCardProps {
  property: Property;
  onShare: (property: Property) => void;
}

const PropertyCardForDashboard: React.FC<PropertyCardProps> = ({
  property,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "sold":
        return "bg-red-100 text-red-800";
      case "rented":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const primaryImage =
    property.images?.[0]?.url ||
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg";

  const isLandOrPlot =
    property.category && ["land", "plot"].includes(property.category);

  /* -------- PROPERTY DETAILS -------- */

  type DetailItem = {
    label: string;
    value: string | number;
    icon?: boolean;
  };

  const propertyDetails: DetailItem[] = [];

  const hasValue = (value: unknown): boolean => {
    if (value === undefined || value === null) return false;
    if (
      typeof value === "string" &&
      ["", "n/a", "na"].includes(value.toLowerCase())
    )
      return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  };

  if (!isLandOrPlot && hasValue(property.furnishing)) {
    propertyDetails.push({
      label: "Furnishing",
      value: property.furnishing ?? "",
    });
  }

  if (hasValue(property.water_source)) {
    propertyDetails.push({
      label: "Water Supply",
      value: Array.isArray(property.water_source)
        ? property.water_source.join(", ")
        : property.water_source ?? "",
    });
  }

  if (hasValue(property.is_corner_plot)) {
    propertyDetails.push({
      label: "Corner Plot",
      value: property.is_corner_plot ? "Yes" : "No",
    });
  }

  if (
    !isLandOrPlot &&
    hasValue(property.power_backup) &&
    property.power_backup !== "None"
  ) {
    propertyDetails.push({
      label: "Power Backup",
      value: property.power_backup ?? "",
    });
  }

  if (hasValue(property.rera_status)) {
    propertyDetails.push({
      label: "RERA",
      value: property.rera_status ?? "",
    });
  }

  if (hasValue(property.gated_community)) {
    propertyDetails.push({
      label: "Gated Community",
      value: property.gated_community ? "Yes" : "No",
    });
  }

  if (!isLandOrPlot && hasValue(property.flooring_type)) {
    propertyDetails.push({
      label: "Flooring",
      value: property.flooring_type ?? "",
    });
  }

  if (hasValue(property.property_age)) {
    propertyDetails.push({
      label: "Age",
      value: property.property_age ?? "",
    });
  }

  /* -------- DISTRIBUTE INTO 3 COLUMNS -------- */

  const allDetails: DetailItem[] = [
    {
      label: "Location",
      value: property.location || "Not Available",
      icon: true,
    },
    hasValue(property.category)
      ? { label: "Category", value: property.category ?? "" }
      : null,
    property.size
      ? {
          label: "Size",
          value: `${property.size} ${property.size_unit ?? ""}`,
        }
      : null,

    ...propertyDetails,
  ].filter((item): item is DetailItem => Boolean(item));

  const col1: DetailItem[] = [];
  const col2: DetailItem[] = [];
  const col3: DetailItem[] = [];

  allDetails.forEach((item, index) => {
    if (index % 3 === 0) col1.push(item);
    else if (index % 3 === 1) col2.push(item);
    else col3.push(item);
  });
  const isGoogleMapsLink = (value?: string | number) => {
    if (!value || typeof value !== "string") return false;
    return (
      value.includes("google.com/maps") || value.includes("maps.google.com")
    );
  };


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
      {/* IMAGE */}
      <Link href={`/agent/properties/${property._id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={getPropertyImageUrlWithFallback(primaryImage)}
            alt={property.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
          <span
            className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
              property.status
            )}`}
          >
            {property.status}
          </span>
        </div>
      </Link>

      {/* CONTENT */}
      <div className="p-3">
        {/* TITLE & PRICE */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-base truncate pr-2">
            {property.title}
          </h3>

          {typeof property.price === "number" && property.price > 0 && (
            <span className="text-lg font-bold text-primary">
              {formatPrice(property.price)}
            </span>
          )}
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-3 gap-x-6">
          {[col1, col2, col3].map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-2">
              {column.map((detail, index) => (
                <div key={index} className="flex flex-col min-w-0">
                  <span className="text-[10px] text-gray-500 flex items-center">
                    {detail.icon && <MapPinIcon className="h-3 w-3 mr-1" />}
                    {detail.label}
                  </span>
                  {detail.label === "Location" &&
                  isGoogleMapsLink(detail.value) ? (
                    <a
                      href={String(detail.value)}
                      target="_blank"
                      rel="noopener noreferrer"
                      // className="inline-flex items-center mt-1 w-fit rounded-md border border-primary px-2 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-white transition"
                      className="inline-flex items-center mt-1 underline text-primary text-sm lg:text-xs whitespace-nowrap"
                    >
                      <FaDirections className="!h-[15px] !w-[15px] lg:!h-[15px] lg:!w-[15px] shrink-0" />
                      <span className="ml-1">Get Directions</span>
                    </a>
                  ) : (
                    <span className="text-xs font-medium text-gray-900 truncate capitalize">
                      {detail.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyCardForDashboard;
