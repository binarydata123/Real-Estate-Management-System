import React from "react";
import { MapPinIcon, ShareIcon, EyeIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { BathIcon, BedDoubleIcon, RulerIcon } from "lucide-react";

interface PropertyCardProps {
  property: Property;
  onShare?: (property: Property) => void;
  onView?: (property: Property) => void;
  onToggleFavorite?: (property: Property) => void;
  isfavorite?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onShare,
  onView,
}) => {
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      // 1 crore
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      // 1 lakh
      return `₹${(price / 100000).toFixed(1)}L`;
    } else {
      return `₹${price.toLocaleString()}`;
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
    property?.images?.length > 0
      ? (() => {
          const primary = property.images.find((img) => img.isPrimary);
          return primary
            ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/Properties/original/${primary.url}`
            : `https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg`;
        })()
      : "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg";

  return (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Image */}
      <div className="relative aspect-[4/3] md:aspect-[16/9] overflow-hidden">
        <Image
          width={400}
          height={200}
          src={primaryImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex capitalize items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              property.status
            )}`}
          >
            {property.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-6">
        {/* Title & Price */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-base md:text-lg mb-1">
              {property.title}
            </h3>
            <div className="flex items-center text-xs md:text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {property.location}
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg md:text-2xl font-bold text-gray-900">
              {formatPrice(property.price)}
            </p>
          </div>
        </div>

        {/* Property Info Badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-700 text-xs md:text-sm mb-4">
          {property.size && (
            <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-md">
              <RulerIcon className="h-4 w-4 text-blue-500" />
              <span>
                {property.size} {property.size_unit}
              </span>
            </div>
          )}
          {property.bedrooms && (
            <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-md">
              <BedDoubleIcon className="h-4 w-4 text-green-500" />
              <span>{property.bedrooms} BHK</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-md">
              <BathIcon className="h-4 w-4 text-purple-500" />
              <span>{property.bathrooms} Bath</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 w-full">
          <button
            onClick={() => onView?.(property)}
            className="flex items-center justify-center px-4 py-2 
               bg-blue-600 text-white rounded-lg 
               hover:bg-blue-700 transition-colors 
               flex-grow"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            View Details
          </button>
          <button
            onClick={() => onShare?.(property)}
            className="flex items-center justify-center 
               px-4 py-3 
               border border-gray-300 text-gray-700 rounded-lg 
               hover:bg-gray-50 transition-colors"
          >
            <ShareIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
