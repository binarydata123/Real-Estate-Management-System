import React, { useState } from "react";
import { MapPinIcon, ShareIcon, EyeIcon } from "@heroicons/react/24/outline";
// import Image from "next/image";
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
  // handleImageError,
} from "@/lib/imageUtils";
import { showErrorToast } from "@/utils/toastHandler";
import { formatPrice } from "@/utils/helperFunction";

interface PropertyCardProps {
  property: Property;
  onShare?: (property: Property) => void;
  onToggleFavorite?: (property: Property) => void;
  onRefresh?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onShare,
  onRefresh,
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
      <Link href={`/agent/properties/${property._id}`}>
        <div className="relative aspect-[16/10] md:aspect-[4/3] overflow-hidden">
          <img
            src={primaryImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 md:top-3 md:left-3">
            <span
              className={`inline-flex capitalize items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                property.status
              )}`}
            >
              {property.status}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-3 md:p-4 flex flex-col flex-grow">
        <Link href={`/agent/properties/${property._id}`} className="mb-2">
          <h3 className="font-semibold text-gray-800 text-base md:text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {property.title}
          </h3>
        </Link>

        {(property.price ?? 0) > 0 && (
          <p className="text-lg md:text-xl font-bold text-primary mb-2">
            {formatPrice(property.price as number)}
          </p>
        )}

        {property.location && (
          <div className="flex items-center text-xs md:text-sm text-gray-500 mb-3">
            <MapPinIcon className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
        )}

        <div className="flex-grow mb-3">
          {hasKeyDetails ? (
            <div className="grid grid-cols-2 gap-2 text-xs md:text-sm text-gray-700">
              {(property.built_up_area ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <RulerIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                  <span className="truncate">
                    {property.built_up_area} {property.unit_area_type}
                  </span>
                </div>
              )}
              {(property.bedrooms ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <BedDoubleIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                  <span>{property.bedrooms} BHK</span>
                </div>
              )}
              {(property.bathrooms ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <BathIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                  <span>{property.bathrooms} Bath</span>
                </div>
              )}
              {property.furnishing && (
                <div className="flex items-center gap-1">
                  <Armchair className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                  <span className="capitalize truncate">{property.furnishing}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
              {property.description ||
                "No description available for this property."}
            </p>
          )}
        </div>

        <div className="mt-auto pt-2.5 border-t border-gray-100">
          <div className="flex gap-1.5 md:gap-2">
            <Link href={`/agent/properties/${property._id}`} className="flex-1">
              <button className="w-full flex items-center justify-center px-3 md:px-4 py-2 md:py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 active:bg-primary/80 transition-colors text-xs md:text-sm font-medium">
                <EyeIcon className="h-4 w-4 mr-1.5" />
                <span>View</span>
              </button>
            </Link>
            <button
              onClick={() => onShare?.(property)}
              className="flex items-center justify-center p-2 md:p-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
              title="Share"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
            <Link href={`/agent/edit-property/${property._id}`}>
              <button
                className="flex items-center justify-center p-2 md:p-2.5 border border-blue-300 text-blue-500 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors"
                title="Edit"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </Link>
            <button
              onClick={() => {
                setSelectedProperty(property._id as string);
                setShowConfirmDialog(true);
              }}
              className="flex items-center justify-center p-2 md:p-2.5 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors"
              title="Delete"
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
