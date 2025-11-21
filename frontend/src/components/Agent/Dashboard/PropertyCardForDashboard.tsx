"use client";

import React from "react";
import {
  MapPinIcon,
  ShareIcon,
  EyeIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import Image from "next/image";
import {
  getPropertyImageUrlWithFallback,
  handleImageError,
} from "@/lib/imageUtils";

interface PropertyCardProps {
  property: Property;
  onShare?: (property: Property) => void;
  onView?: (property: Property) => void;
  onFavorite?: (property: Property) => void;
  isFavorited?: boolean;
}

const PropertyCardForDashboard: React.FC<PropertyCardProps> = ({
  property,
  onShare,
  onView,
  onFavorite,
  isFavorited = false,
}) => {
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      // 1 crore
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      // 1 lakh
      return `₹${(price / 100000).toFixed(1)}L`;
    } else if (price < 100000) {
      return `₹${price?.toLocaleString()}`;
    }
  };

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
    <div
      onClick={() => onView?.(property)}
      className="bg-white rounded-lg md:rounded-xl  shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          width={400}
          height={300}
          src={getImageUrl(primaryImage)}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite?.(property);
            }}
            className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            {isFavorited ? (
              <HeartSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          {property.images?.length > 1 && (
            <div className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium text-white">
              +{property.images.length - 1}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-1 md:p-4 flex flex-col flex-1">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <h3 className="font-semibold text-gray-900 text-base md:text-lg leading-tight pr-2 flex-1 truncate">
              {property.title}
            </h3>
            <p className="text-lg md:text-xl font-bold text-blue-600 flex-shrink-0">
              {formatPrice(property.price as number)}
            </p>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{property.location}</span>
          </div>

          {/* Property Details */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs md:text-sm text-gray-600 md:mt-1">
            <span className="bg-gray-100 px-2 py-0.5 rounded capitalize">
              {property.category}
            </span>
            {property.size && (
              <span className="flex items-center">
                {property.size} {property.size_unit}
              </span>
            )}
            {property.bedrooms && (
              <span className="flex items-center">{property.bedrooms} BHK</span>
            )}
            {property.bathrooms && (
              <span className="flex items-center">
                {property.bathrooms} Bath
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="md:flex hidden space-x-2 md:mt-4 mt-1 p-1 md:pt-3 border-t border-gray-100">
          <button
            onClick={() => onView?.(property)}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            View
          </button>
          <button
            onClick={() => onShare?.(property)}
            className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShareIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCardForDashboard;
