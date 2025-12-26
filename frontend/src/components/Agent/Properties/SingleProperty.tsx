/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  deleteProperty,
  getSinglePropertyDetail,
} from "@/lib/Agent/PropertyAPI";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PencilIcon,
  // PlayCircleIcon,
  ShareIcon,
  TrashIcon,
} from "lucide-react";
import SharePropertyModal from "../Common/SharePropertyModal";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
import { useToast } from "@/context/ToastContext";
import { showErrorToast } from "@/utils/toastHandler";
import { capitalizeFirstLetter } from "@/helper/capitalizeFirstLetter";
import { FaDirections } from "react-icons/fa"

interface Images {
  _id?: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface SinglePropertyProps {
  propertyId: string;
}

const SingleProperty: React.FC<SinglePropertyProps> = ({ propertyId }) => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<Images | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [propertyData, setPropertyData] = useState<Property | null>(null);
  const { showToast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    getProperty();
  }, [propertyId]);

  const getProperty = async () => {
    if (propertyId) {
      try {
        const id = Array.isArray(propertyId) ? propertyId[0] : propertyId;
        const response = await getSinglePropertyDetail(id);
        const data = response.data;
        setPropertyData(data);
        const primaryImg =
          data.images.find((img: Images) => img.isPrimary) ||
          data.images[0] ||
          null;
        setSelectedImage(primaryImg);
      } catch (error) {
        showErrorToast("Failed to load property details", error);
      }
    }
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/Properties/original/${url}`;
  };

  const isVideo = (url: string) => {
    const videoExtensions = [".mp4", ".webm", ".ogg"];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteProperty(id);
      if (response.success) {
        showToast(response.message, "success");
        router.back();
      }
    } catch (err) {
      showErrorToast("Failed to delete property:", err);
    }
  };

  const hasValue = (val: any) =>
    val !== null && val !== undefined && val !== "";

  const getLocation = (location: string | undefined) => {
    if (location?.startsWith("https")) {
      return "Get Directions";
    }
    return location;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-2 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Share Modal */}
        {showShareModal && propertyData && (
          <SharePropertyModal
            property={propertyData}
            onClose={() => setShowShareModal(false)}
          />
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={showConfirmDialog}
          onCancel={() => setShowConfirmDialog(false)}
          onConfirm={() => {
            if (propertyData && propertyData._id)
              handleDelete(propertyData._id);
            setShowConfirmDialog(false);
          }}
          heading="Are you sure?"
          description="This property will be deleted, and this action cannot be undone."
          confirmText="Delete"
          cancelText="Back"
          confirmColor="bg-red-600 hover:bg-red-700"
        />

        {/* Header with Back and Actions */}
        <div className="flex sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-blue-600 text-gray-700 hover:text-white font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Properties</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-600"
            >
              <ShareIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <Link href={`/agent/edit-property/${propertyId}`}>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 hover:border-green-600">
                <PencilIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </Link>
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 hover:border-red-600"
            >
              <TrashIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          {/* Main Image */}
          <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gray-100">
            {selectedImage?.url ? (
              isVideo(selectedImage.url) ? (
                <video
                  src={getImageUrl(selectedImage.url)}
                  controls
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={getImageUrl(selectedImage.url)}
                  alt={
                    selectedImage.alt || propertyData?.title || "Property Image"
                  }
                  fill
                  className="object-cover"
                  priority={true}
                />
              )
            ) : (
              <Image
                src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"
                alt="Default Property Image"
                fill
                className="object-cover"
                priority={true}
              />
            )}

            {propertyData?.images && propertyData?.images?.length > 1 && (
              <>
                {/* Prev Button */}
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-blue-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                  onClick={() => {
                    if (!propertyData?.images?.length || !selectedImage) return;
                    const idx = propertyData.images.findIndex(
                      (img) => img._id === selectedImage._id
                    );
                    const prevIdx =
                      (idx - 1 + propertyData.images.length) %
                      propertyData.images.length;
                    setSelectedImage(propertyData.images[prevIdx]);
                  }}
                >
                  (
                </button>

                {/* Next Button */}
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-blue-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                  onClick={() => {
                    if (!propertyData?.images?.length || !selectedImage) return;
                    const idx = propertyData.images.findIndex(
                      (img) => img._id === selectedImage._id
                    );
                    const nextIdx = (idx + 1) % propertyData.images.length;
                    setSelectedImage(propertyData.images[nextIdx]);
                  }}
                >
                  )
                </button>
              </>
            )}
          </div>

          <div className="px-6 py-3 md:p-8">
            {/* Basic Info */}
            <div className="mb-2 pb-2 border-b border-gray-200">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
                {propertyData?.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium mb-1">Type</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {capitalizeFirstLetter(propertyData?.type)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Category
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {capitalizeFirstLetter(propertyData?.category)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Location
                  </p>
                  <p
                    onClick={() =>
                      getLocation(propertyData?.location) === "Get Directions" &&
                      window.open(propertyData?.location)
                    }
                    className={`text-lg font-semibold flex gap-[2px] ${
                      getLocation(propertyData?.location) === "Get Directions"
                        ? "text-green-600 underline cursor-pointer"
                        : "text-gray-900"
                    }`}
                  >
                    {propertyData?.location?.startsWith("https") ? <FaDirections className="!w-[12px]"/> : ""}
                    {getLocation(propertyData?.location) || "Not Added Yet"}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Price
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {propertyData?.price ? `₹ ${propertyData?.price}` : "Not Added Yet"}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Status
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {propertyData?.status}
                  </p>
                </div>
              </div>
              <div className="mt-2 bg-gray-50 rounded-lg p-5 border border-gray-200">
                <p className="text-gray-700 leading-relaxed">
                  {propertyData?.description}
                </p>
              </div>
            </div>

            {/* Area & Configuration */}
            <div className="mb-2 pb-2 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                Area & Configuration
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {hasValue(propertyData?.built_up_area) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Built-up Area</p>
                      <p className="text-gray-900 font-medium">
                        {propertyData?.built_up_area}{" "}
                        {propertyData?.unit_area_type}
                      </p>
                    </div>
                  </div>
                ) : ""}
                {hasValue(propertyData?.carpet_area) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Carpet Area</p>
                      <p className="text-gray-900 font-medium">
                        {propertyData?.carpet_area}{" "}
                        {propertyData?.unit_area_type}
                      </p>
                    </div>
                  </div>
                ) : ""}
                {hasValue(propertyData?.plot_front_area) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Plot Front</p>
                      <p className="text-gray-900 font-medium">
                        {propertyData?.plot_front_area}{" "}
                        {propertyData?.plot_dimension_unit}
                      </p>
                    </div>
                  </div>
                ) : ""}
                {hasValue(propertyData?.plot_depth_area) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Plot Depth</p>
                      <p className="text-gray-900 font-medium">
                        {propertyData?.plot_depth_area}{" "}
                        {propertyData?.plot_dimension_unit}
                      </p>
                    </div>
                  </div>
                ) : ""}
                {hasValue(propertyData?.is_corner_plot) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Corner Plot</p>
                      <p className="text-gray-900 font-medium">
                        {propertyData?.is_corner_plot}
                      </p>
                    </div>
                  </div>
                ) : ""}
                {hasValue(propertyData?.bedrooms) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Bedrooms</p>
                      <p className="text-gray-900 font-medium">
                        {propertyData?.bedrooms}
                      </p>
                    </div>
                  </div>
                ) : ""}
                {hasValue(propertyData?.bathrooms) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Bathrooms</p>
                      <p className="text-gray-900 font-medium">
                        {propertyData?.bathrooms}
                      </p>
                    </div>
                  </div>
                ) : ""}
                {hasValue(propertyData?.washrooms) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Washrooms</p>
                      <p className="text-gray-900 font-medium">
                        {propertyData?.washrooms}
                      </p>
                    </div>
                  </div>
                ) : ""}
                {hasValue(propertyData?.balconies) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Balconies</p>
                      <p className="text-gray-900 font-medium">
                        {propertyData?.balconies}
                      </p>
                    </div>
                  </div>
                ) : ""}
                {hasValue(propertyData?.floor_number) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Floor Number</p>
                      <p className="text-gray-900 font-medium">
                        {propertyData?.floor_number}
                      </p>
                    </div>
                  </div>
                ) : ""}
                {hasValue(propertyData?.total_floors) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Total Floors</p>
                      <p className="text-gray-900 font-medium">
                        {propertyData?.total_floors}
                      </p>
                    </div>
                  </div>
                ) : ""}
              </div>
            </div>

            {/* Facing & Overlooking */}
            {(hasValue(propertyData?.facing) &&
              hasValue(propertyData?.overlooking)) ? (
              <div className="mb-2 pb-2 border-b border-gray-200">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                  Facing & Overlooking
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {hasValue(propertyData?.facing) ? (
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-5 border border-blue-100">
                      <p className="text-sm text-blue-600 font-medium mb-2">
                        Facing
                      </p>
                      <p className="text-gray-900 font-semibold text-lg">
                        {propertyData?.facing}
                      </p>
                    </div>
                  ) : ""}
                  {hasValue(propertyData?.overlooking) &&
                    propertyData?.overlooking && propertyData?.overlooking?.length > 0 ? (
                      <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-5 border border-blue-100">
                        <p className="text-sm text-blue-600 font-medium mb-2">
                          Overlooking
                        </p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {propertyData?.overlooking?.join(", ")}
                        </p>
                      </div>
                    ) : ""}
                </div>
              </div>
            ) : ""}

            {/* Additional Info */}
            <div className="mb-2 pb-2 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                Additional Info
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {hasValue(propertyData?.property_age) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Property Age</p>
                      <p className="text-gray-900 font-medium">
                        {capitalizeFirstLetter(propertyData?.property_age)}
                      </p>
                    </div>
                  </div>
                ) : ""}
                {hasValue(propertyData?.transaction_type) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Transaction Type</p>
                      <p className="text-gray-900 font-medium">
                        {capitalizeFirstLetter(propertyData?.transaction_type)}
                      </p>
                    </div>
                  </div>
                ) : ""}
                {hasValue(propertyData?.gated_community) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Gated Community</p>
                      <p className="text-gray-900 font-medium">
                        {propertyData?.gated_community}
                      </p>
                    </div>
                  </div>
                ) : ""}
                {hasValue(propertyData?.furnishing) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Furnishing</p>
                      <p className="text-gray-900 font-medium">
                        {capitalizeFirstLetter(propertyData?.furnishing)}
                      </p>
                    </div>
                  </div>
                ) : ""}
                {hasValue(propertyData?.flooring_type) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Flooring Type</p>
                      <p className="text-gray-900 font-medium">
                        {capitalizeFirstLetter(propertyData?.flooring_type)}
                      </p>
                    </div>
                  </div>
                ) : ""}
                {hasValue(propertyData?.power_backup) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">Power Backup</p>
                      <p className="text-gray-900 font-medium">
                        {capitalizeFirstLetter(propertyData?.power_backup)}
                      </p>
                    </div>
                  </div>
                ) : ""}
                {hasValue(propertyData?.rera_status) ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                    <span className="text-blue-600 font-semibold">•</span>
                    <div>
                      <p className="text-sm text-gray-600">RERA Status</p>
                      <p className="text-gray-900 font-medium">
                        {capitalizeFirstLetter(propertyData?.rera_status)}
                      </p>
                    </div>
                  </div>
                ) : ""}
              </div>
              <div className="mt-2 space-y-2">
                {hasValue(propertyData?.amenities) &&
                  propertyData?.amenities && propertyData?.amenities?.length > 0 ? (
                    <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                      <p className="text-sm text-blue-600 font-medium mb-2">
                        Amenities
                      </p>
                      {propertyData?.amenities?.map((amenity, index) => (
                        <span key={index}>
                          {capitalizeFirstLetter(amenity)},{" "}
                        </span>
                      ))}
                    </div>
                  ) : ""}
                {hasValue(propertyData?.features) &&
                  propertyData?.features && propertyData?.features?.length > 0 ? (
                    <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                      <p className="text-sm text-blue-600 font-medium mb-2">
                        Features
                      </p>
                      {propertyData?.features?.map((feature, index) => (
                        <span key={index}>
                          {capitalizeFirstLetter(feature)},{" "}
                        </span>
                      ))}
                    </div>
                  ) : ""}
                {hasValue(propertyData?.water_source) &&
                  propertyData?.water_source && propertyData?.water_source?.length > 0 ? (
                    <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                      <p className="text-sm text-blue-600 font-medium mb-2">
                        Water Source
                      </p>
                      {propertyData?.water_source?.map((source, index) => (
                        <span key={index}>
                          {capitalizeFirstLetter(source)},{" "}
                        </span>
                      ))}
                    </div>
                  ) : ""}
              </div>
            </div>

            {/* Owner Details */}
            {(hasValue(propertyData?.owner_name) ||
              hasValue(propertyData?.owner_contact)) && (
              <div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                  Owner Details
                </h2>
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 border border-blue-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {hasValue(propertyData?.owner_name) && (
                      <div>
                        <p className="text-sm text-blue-600 font-medium mb-1">
                          Name
                        </p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {capitalizeFirstLetter(propertyData?.owner_name)}
                        </p>
                      </div>
                    )}
                    {hasValue(propertyData?.owner_contact) && (
                      <div>
                        <p className="text-sm text-blue-600 font-medium mb-1">
                          Contact
                        </p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {propertyData?.owner_contact}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProperty;
