"use client";

import React from "react";
import { MapPinIcon, EyeIcon } from "@heroicons/react/24/outline";
// import Image from "next/image";
import {
  getPropertyImageUrlWithFallback,
  // handleImageError,
} from "@/lib/imageUtils";
import Link from "next/link";
import { formatPrice } from "@/utils/helperFunction";

interface PropertyCardProps {
  property: Property;
  onShare?: (property: Property) => void;
  onFavorite?: (property: Property) => void;
  isFavorited?: boolean;
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

  const getImageUrl = (url: string) => {
    return getPropertyImageUrlWithFallback(url);
  };
  return (
    <div className="bg-white rounded-lg md:rounded-xl  shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
      {/* Image */}
      <Link href={`/agent/properties/${property._id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* <Image
            width={400}
            height={300}
            src={getImageUrl(primaryImage)}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          /> */}

          <img
            src={getImageUrl(primaryImage)}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute md:top-3 md:left-3 top-2 left-2">
            <span
              className={`inline-flex items-center capitalize px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                property.status
              )}`}
            >
              {property.status}
            </span>
          </div>
          <div className="absolute md:top-3 md:right-3 top-2 right-2 flex items-center space-x-2">
            {property.images?.length > 1 && (
              <div className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                +{property.images.length - 1}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-1 md:p-4 flex flex-col flex-1">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <h3 className="font-semibold text-gray-900 text-base md:text-lg leading-tight pr-2 flex-1 truncate">
              <Link href={`/agent/properties/${property._id}`}>
                {property.title}
              </Link>
            </h3>
            <p className="text-lg md:text-xl font-bold text-blue-600 flex-shrink-0">
              {formatPrice(property.price as number)}
            </p>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{property.location || "N/A"}</span>
          </div>

          {/* Property Details */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs md:text-sm text-gray-600 md:mt-1">
            <span className="bg-gray-100 px-2 py-0.5 rounded capitalize">
              {property.category}
            </span>
            {property?.size && (
              <span className="flex items-center">
                {property.size} {property.size_unit}
              </span>
            )}
            {(property.bedrooms ?? 0) > 0 && (
              <span className="flex items-center">{property.bedrooms} BHK</span>
            )}
            {(property.bathrooms ?? 0) > 0 && (
              <span className="flex items-center">
                {property.bathrooms} Bath
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="md:flex hidden space-x-2 md:mt-4 mt-1 p-1 md:pt-3 border-t border-gray-100">
          <Link
            href={`/agent/properties/${property._id}`}
            className="flex flex-1 item-center justify-center"
          >
            <button className="flex-1 flex items-center justify-center px-3 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <EyeIcon className="h-4 w-4 mr-2" />
              View
            </button>
          </Link>
          {/* <button className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
       Contact Us
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default PropertyCardForDashboard;
