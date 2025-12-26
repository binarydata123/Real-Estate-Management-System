import React from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import {
  Armchair,
  // BathIcon,
  // BedDoubleIcon,
  CircleCheckBig,
  ClockPlus,
  //PencilIcon,
  // RulerIcon,
  SmartphoneCharging,
  //TrashIcon,
} from "lucide-react";

import {
  getPropertyImageUrlWithFallback,
  handleImageError,
} from "@/lib/imageUtils";
import Link from "next/link";
import { formatPrice } from "@/utils/helperFunction";
import { FaDirections } from "react-icons/fa";
import formatToIST from "@/helper/formatTimestampToISTDateTime";

interface PropertyCardProps {
  property: Property;
  onShare?: (property: Property) => void;
  onToggleFavorite?: (property: Property) => void;
  onRefresh?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
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
          return getPropertyImageUrlWithFallback(primary?.url);
        })()
      : getPropertyImageUrlWithFallback();

  // const hasKeyDetails =
  //   (property.built_up_area ?? 0) > 0 ||
  //   (property.bedrooms ?? 0) > 0 ||
  //   (property.bathrooms ?? 0) > 0;

  const getLocation = (location: string | undefined) => {
    if (location?.startsWith("https")) {
      return "Get Directions";
    }
    return location;
  };

  return (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
      {/* Image */}
      <Link href={`/customer/properties/${property._id}`}>
        <div className="relative md:aspect-[4/3] aspect-[17/9]  overflow-hidden">
          <Image
            width={400}
            height={200}
            src={primaryImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
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
      </Link>

      {/* Content */}
      <div className="md:p-4 p-2 flex flex-col flex-grow">
        <div className="">
          <div className="flex items-start justify-between mb-1">
            <Link href={`/customer/properties/${property._id}`}>
              <h3 className="font-semibold text-gray-800 text-base md:text-lg leading-tight group-hover:text-blue-600 transition-colors">
                {property.title}
              </h3>
            </Link>
            {property.price && (
              <p className="text-xl md:text-2xl font-bold text-blue-700">
              {formatPrice(property.price as number)}
            </p>
            )}
          </div>
        </div>

        <div className="flex-grow">
          <>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
                <div className="flex items-center text-sm text-gray-500">
                  <p
                    onClick={() =>
                      getLocation(property?.location) === "Get Directions" &&
                      window.open(property?.location)
                    }
                    className={`text-lg flex gap-1 ${
                      getLocation(property?.location) === "Get Directions"
                        ? "text-blue-600 underline cursor-pointer"
                        : "text-gray-900"
                    }`}
                  >
                    {property?.location?.startsWith("https") ? (
                      <FaDirections className="!w-4 h-4" />
                    ) : (
                      <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                    )}
                    {getLocation(property?.location) || "Not Given"}
                  </p>
                </div>
                {property.furnishing && (
                  <div className="flex items-center">
                    <Armchair className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="capitalize">{property.furnishing}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <SmartphoneCharging className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="capitalize">{property.power_backup} Power Backup</span>
                </div>
                <div className="flex items-center">
                  <CircleCheckBig className="!w-[13px] !h-[13px] mr-1 text-gray-500" />
                  <span className="capitalize">{property.rera_status} (RERA)</span>
                </div>
              </div>
              <div className="flex mt-2 text-gray-700 gap-1">
                <ClockPlus className="!w-[13px] !h-[13px] text-gray-700" />
                <div className="flex gap-[2px]">
                  <span>Created At : </span>
                  <p>{formatToIST(property?.createdAt)}</p>
                </div>
              </div>
            </>
        </div>

        {/* <div className="flex-grow mb-2 md:mb-4">
          {hasKeyDetails ? (
            <div className="grid grid-cols-2 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
              {(property.built_up_area ?? 0) > 0 && (
                <div className="flex items-center">
                  <RulerIcon className="h-4 w-4 mr-1 text-gray-500" />
                  <span>
                    {property.built_up_area} {property.unit_area_type}
                  </span>
                </div>
              )}
              {(property.bedrooms ?? 0) > 0 && (
                <div className="flex items-center">
                  <BedDoubleIcon className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{property.bedrooms} BHK</span>
                </div>
              )}
              {(property.bathrooms ?? 0) > 0 && (
                <div className="flex items-center">
                  <BathIcon className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{property.bathrooms} Bath</span>
                </div>
              )}
              {property.furnishing && (
                <div className="flex items-center">
                  <Armchair className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="capitalize">{property.furnishing}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-600 line-clamp-2">
              {property.description ||
                "No description available for this property."}
            </p>
          )}
        </div> */}

        {/* <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex space-x-2">
            <Link
              href={`/customer/properties/${property._id}`}
              className="flex-1 w-100"
            >
              <button className="flex-1 flex items-center justify-center md:px-4 px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                <EyeIcon className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">View Details</span>
                <span className="md:hidden">View</span>
              </button>
            </Link>
          </div>
        </div> */}
      </div>
    </div>
  );
};
