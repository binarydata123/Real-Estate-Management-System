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
  ShareIcon,
  MapPin,
  Bed,
  Bath,
  Square,
  Layers,
  // Sun,
  Calendar,
  Home,
  Building,
  Zap,
  Shield,
  TrashIcon,
} from "lucide-react";
import SharePropertyModal from "../Common/SharePropertyModal";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
import { useToast } from "@/context/ToastContext";
import { showErrorToast } from "@/utils/toastHandler";
import { capitalizeFirstLetter } from "@/helper/capitalizeFirstLetter";
import { FaDirections } from "react-icons/fa";

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

  const getIconForFeature = (feature: string) => {
    const featureLower = feature.toLowerCase();
    if (featureLower.includes("pool")) return "🏊";
    if (featureLower.includes("gym")) return "💪";
    if (featureLower.includes("park")) return "🌳";
    if (featureLower.includes("security")) return "👮";
    if (featureLower.includes("lift")) return "⬆️";
    if (featureLower.includes("parking")) return "🚗";
    if (featureLower.includes("garden")) return "🌷";
    return "✓";
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-2 px-4">
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
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#0A2540] text-[#0A2540] hover:text-white font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 hover:border-[#0A2540]"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Properties</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0A2540] text-white font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md border border-[#C9A24D]/20 hover:bg-[#B8914A]"
            >
              <ShareIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <Link href={`/agent/edit-property/${propertyId}`}>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0A2540] text-white font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md border border-[#C9A24D] hover:bg-[#0E2F52]">
                <PencilIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </Link>
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0A2540] text-white font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md border border-[#C9A24D] hover:border-red-600"
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#0A2540] p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                  onClick={() => {
                    if (!propertyData?.images?.length || !selectedImage) return;
                    const idx = propertyData.images.findIndex(
                      (img) => img._id === selectedImage._id,
                    );
                    const prevIdx =
                      (idx - 1 + propertyData.images.length) %
                      propertyData.images.length;
                    setSelectedImage(propertyData.images[prevIdx]);
                  }}
                >
                  ‹
                </button>

                {/* Next Button */}
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#0A2540] p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                  onClick={() => {
                    if (!propertyData?.images?.length || !selectedImage) return;
                    const idx = propertyData.images.findIndex(
                      (img) => img._id === selectedImage._id,
                    );
                    const nextIdx = (idx + 1) % propertyData.images.length;
                    setSelectedImage(propertyData.images[nextIdx]);
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20"> */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Quick Stats */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-[#0A2540]">
                  {propertyData?.title}
                </h1>
                {propertyData?.location?.startsWith("https") && (
                  <button
                    onClick={() => window.open(propertyData.location)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0A2540] text-white rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    <FaDirections className="h-4 w-4" />
                    <span className="font-medium">Directions</span>
                  </button>
                )}
              </div>

              <div>
                {/* <h3 className="text-lg font-semibold text-[#0A2540] mb-3">Property Details</h3> */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {hasValue(propertyData?.property_age) && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Calendar className="h-5 w-5 text-[#C9A24D]" />
                      <div>
                        <p className="text-sm text-gray-500">Property Age</p>
                        <p className="font-medium text-[#0A2540]">
                          {capitalizeFirstLetter(propertyData?.property_age)}
                        </p>
                      </div>
                    </div>
                  )}
                  {hasValue(propertyData?.furnishing) && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Home className="h-5 w-5 text-[#C9A24D]" />
                      <div>
                        <p className="text-sm text-gray-500">Furnishing</p>
                        <p className="font-medium text-[#0A2540]">
                          {capitalizeFirstLetter(propertyData?.furnishing)}
                        </p>
                      </div>
                    </div>
                  )}
                  {hasValue(propertyData?.transaction_type) && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Building className="h-5 w-5 text-[#C9A24D]" />
                      <div>
                        <p className="text-sm text-gray-500">
                          Transaction Type
                        </p>
                        <p className="font-medium text-[#0A2540]">
                          {capitalizeFirstLetter(
                            propertyData?.transaction_type,
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  {hasValue(propertyData?.power_backup) && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Zap className="h-5 w-5 text-[#C9A24D]" />
                      <div>
                        <p className="text-sm text-gray-500">Power Backup</p>
                        <p className="font-medium text-[#0A2540]">
                          {capitalizeFirstLetter(propertyData?.power_backup)}
                        </p>
                      </div>
                    </div>
                  )}
                  {hasValue(propertyData?.rera_status) && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Shield className="h-5 w-5 text-[#C9A24D]" />
                      <div>
                        <p className="text-sm text-gray-500">RERA Status</p>
                        <p className="font-medium text-[#0A2540]">
                          {capitalizeFirstLetter(propertyData?.rera_status)}
                        </p>
                      </div>
                    </div>
                  )}
                  {propertyData?.location?.startsWith("https") ? (
                    ""
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <MapPin className="h-5 w-5 text-[#C9A24D]" />
                      <div>
                        <p className="text-sm text-gray-500">Location Given</p>
                        <p className="font-medium text-[#0A2540]">
                          {propertyData?.location}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Metrics */}

              {/* Description */}
              {propertyData?.description && (
                <div className="mb-4 mt-4">
                  <h3 className="text-lg font-semibold text-[#0A2540] mb-3">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
                    {propertyData.description}
                  </p>
                </div>
              )}

              {hasValue(propertyData?.bedrooms) ||
              hasValue(propertyData?.bathrooms) ||
              hasValue(propertyData?.built_up_area) ||
              hasValue(propertyData?.floor_number) ? (
                <div>
                  <h3 className="text-lg font-semibold text-[#0A2540] mb-3">
                    Property Details
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {hasValue(propertyData?.bedrooms) && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-[#C9A24D]/10 rounded-lg">
                          <Bed className="h-5 w-5 text-[#C9A24D]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Bedrooms</p>
                          <p className="text-lg font-bold text-[#0A2540]">
                            {propertyData?.bedrooms}
                          </p>
                        </div>
                      </div>
                    )}
                    {hasValue(propertyData?.bathrooms) && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-[#C9A24D]/10 rounded-lg">
                          <Bath className="h-5 w-5 text-[#C9A24D]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Bathrooms</p>
                          <p className="text-lg font-bold text-[#0A2540]">
                            {propertyData?.bathrooms}
                          </p>
                        </div>
                      </div>
                    )}
                    {hasValue(propertyData?.built_up_area) && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-[#C9A24D]/10 rounded-lg">
                          <Square className="h-5 w-5 text-[#C9A24D]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Built-up Area</p>
                          <p className="text-lg font-bold text-[#0A2540]">
                            {propertyData?.built_up_area}{" "}
                            {propertyData?.unit_area_type}
                          </p>
                        </div>
                      </div>
                    )}
                    {hasValue(propertyData?.floor_number) && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-[#C9A24D]/10 rounded-lg">
                          <Layers className="h-5 w-5 text-[#C9A24D]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Floors</p>
                          <p className="text-lg font-bold text-[#0A2540]">
                            {propertyData?.floor_number}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                ""
              )}

              {/* <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {getLocation(propertyData?.location) || "Location not specified"}
                  </span>
                </div> */}

              {/* Details Grid */}
              <div className="space-y-6">
                {/* Facing & Overlooking */}
                {hasValue(propertyData?.facing) &&
                hasValue(propertyData?.overlooking) ? (
                  <div>
                    <h3 className="text-lg font-semibold text-[#0A2540] mb-3 flex items-center gap-2">
                      {/* <Sun className="h-5 w-5 text-[#C9A24D]" /> */}
                      Facing & Overlooking
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hasValue(propertyData?.facing) && (
                        <div className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="text-sm text-[#C9A24D] font-medium mb-1">
                            Facing
                          </p>
                          <p className="text-[#0A2540] font-semibold">
                            {capitalizeFirstLetter(propertyData?.facing)}
                          </p>
                        </div>
                      )}
                      {hasValue(propertyData?.overlooking) &&
                        (propertyData?.overlooking?.length ?? 0) > 0 && (
                          <div className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-sm text-[#C9A24D] font-medium mb-1">
                              Overlooking
                            </p>
                            <p className="text-[#0A2540] font-semibold">
                              {propertyData?.overlooking
                                ?.map((look) => capitalizeFirstLetter(look))
                                .join(", ")}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                ) : (
                  ""
                )}

                {/* Additional Details */}

                {/* Amenities */}
                {hasValue(propertyData?.amenities) &&
                  (propertyData?.amenities?.length ?? 0) > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#0A2540] mb-3">
                        Amenities
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {propertyData?.amenities?.map((amenity, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#0A2540]/5 to-[#C9A24D]/5 rounded-lg border border-[#C9A24D]/10"
                          >
                            <span className="text-lg">
                              {getIconForFeature(amenity)}
                            </span>
                            <span className="text-sm font-medium text-[#0A2540]">
                              {capitalizeFirstLetter(amenity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Features */}
                {hasValue(propertyData?.features) &&
                  (propertyData?.features?.length ?? 0) > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#0A2540] mb-3">
                        Features
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {propertyData?.features?.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                          >
                            <div className="h-8 w-8 rounded-lg bg-[#C9A24D]/10 flex items-center justify-center">
                              <span className="text-[#C9A24D]">✓</span>
                            </div>
                            <span className="text-[#0A2540] font-medium">
                              {capitalizeFirstLetter(feature)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Owner Details */}
                {(hasValue(propertyData?.owner_name) ||
                  hasValue(propertyData?.owner_contact)) && (
                  <div className="bg-gradient-to-r from-[#0A2540]/5 to-[#C9A24D]/5 rounded-2xl p-6 border border-[#C9A24D]/20">
                    <h3 className="text-lg font-semibold text-[#0A2540] mb-4">
                      Owner Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {hasValue(propertyData?.owner_name) && (
                        <div>
                          <p className="text-sm text-[#C9A24D] font-medium mb-1">
                            Name
                          </p>
                          <p className="text-xl font-bold text-[#0A2540]">
                            {capitalizeFirstLetter(propertyData?.owner_name)}
                          </p>
                        </div>
                      )}
                      {hasValue(propertyData?.owner_contact) && (
                        <div>
                          <p className="text-sm text-[#C9A24D] font-medium mb-1">
                            Contact
                          </p>
                          <a
                            href={`tel:${propertyData?.owner_contact}`}
                            className="text-xl font-bold text-[#0A2540] hover:text-[#C9A24D] transition-colors"
                          >
                            {propertyData?.owner_contact}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};

export default SingleProperty;
