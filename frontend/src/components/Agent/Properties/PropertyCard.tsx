import React, { useState } from "react";
import { MapPinIcon, ShareIcon, EyeIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import {
  Armchair,
  BathIcon,
  BedDoubleIcon,
  PencilIcon,
  RulerIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
import { deleteProperty } from "@/lib/Agent/PropertyAPI";
import { useToast } from "@/context/ToastContext";
import {
  getPropertyImageUrlWithFallback,
  handleImageError,
} from "@/lib/imageUtils";
import { showErrorToast } from "@/utils/toastHandler";

interface PropertyCardProps {
  property: Property;
  onShare?: (property: Property) => void;
  onView?: (property: Property) => void;
  onToggleFavorite?: (property: Property) => void;
  onRefresh?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onShare,
  onRefresh,
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

    const value = Number(price);

    // Handle zero
    if (value === 0) {
      return "₹0";
    }

    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value.toLocaleString()}`;
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
          return getPropertyImageUrlWithFallback(primary?.url);
        })()
      : getPropertyImageUrlWithFallback();

  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteProperty(id);
      if (response.success) {
        showToast(response.message, "success");
        onRefresh?.();
      }
    } catch (error) {
      showErrorToast("Failed to delete property:", error);
    }
  };

  const hasKeyDetails =
    (property.built_up_area ?? 0) > 0 ||
    (property.bedrooms ?? 0) > 0 ||
    (property.bathrooms ?? 0) > 0 ||
    !!property.furnishing;

  return (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
      {/* Image */}
      <Link href={`/agent/properties/${property._id}`}>
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
            <Link href={`/agent/properties/${property._id}`}>
              <h3 className="font-semibold text-gray-800 text-base md:text-lg leading-tight group-hover:text-blue-600 transition-colors">
                {property.title}
              </h3>
            </Link>
            {(property.price ?? 0) > 0 && (
              <p className="text-xl md:text-2xl font-bold text-blue-700">
                {formatPrice(property.price as number)}
              </p>
            )}
          </div>
          {property.location && (
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{property.location}</span>
            </div>
          )}
        </div>

        <div className="flex-grow mb-2 md:mb-4">
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
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex space-x-2">
            <Link href={`/agent/properties/${property._id}`}>
              <button className="flex-1 flex items-center justify-center md:px-4 px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                <EyeIcon className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">View Details</span>
                <span className="md:hidden">View</span>
              </button>
            </Link>
            <button
              onClick={() => onShare?.(property)}
              className="flex items-center justify-center md:px-4 px-2 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
            <Link href={`/agent/edit-property/${property._id}`}>
              <button className="flex items-center justify-center md:px-4 px-2 py-2 border border-blue-300 text-blue-400 rounded-lg hover:bg-gray-50 transition-colors">
                <PencilIcon className="h-4 w-4" />
              </button>
            </Link>
            <button
              onClick={() => {
                setSelectedProperty(property._id as string);
                setShowConfirmDialog(true);
              }}
              className="flex items-center justify-center md:px-4 px-2 py-2 border border-red-300 text-red-400 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={showConfirmDialog}
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          if (selectedProperty) {
            handleDelete(selectedProperty);
          }
          setShowConfirmDialog(false);
          setSelectedProperty(null);
        }}
        heading="Are you sure?"
        description="This property will be deleted, and this action cannot be undone."
        confirmText="Delete"
        cancelText="Back"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};
