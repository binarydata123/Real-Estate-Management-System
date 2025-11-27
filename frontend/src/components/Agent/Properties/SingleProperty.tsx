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
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  PlayCircleIcon,
  ShareIcon,
  TrashIcon,
  MapPinIcon,
  HomeIcon,
  BathIcon,
  BedIcon,
  SquareIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  Building,
  Armchair,
  Handshake,
  Layers,
  Compass,
  Eye,
  DropletsIcon,
  Zap,
  Gavel,
  Shield,
  LandPlot,
} from "lucide-react";
import SharePropertyModal from "../Common/SharePropertyModal";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
import { useToast } from "@/context/ToastContext";
import { showErrorToast } from "@/utils/toastHandler";
import { formatPrice } from "@/utils/helperFunction";
import { capitalizeFirstLetter } from "@/helper/capitalizeFirstLetter";

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
  const [imageLoading, setImageLoading] = useState(true);
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

  const InfoCard = ({
    title,
    children,
    className = "",
  }: {
    title: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={`bg-gray-50 rounded-2xl p-4 border border-gray-100 ${className}`}
    >
      <h3 className="font-semibold text-gray-800 mb-3 text-lg">{title}</h3>
      {children}
    </div>
  );

  const DetailItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: any;
  }) => (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0">
      <div className="bg-blue-50 p-2 rounded-lg">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-medium text-gray-900 capitalize">{value || "N/A"}</p>
      </div>
    </div>
  );

  if (!propertyData) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const isPlotOrLand = ["plot", "land"].includes(
    propertyData.category as string
  );
  const isResidential = propertyData.type === "residential";
  const isCommercial = propertyData.type === "commercial";

  const hasValue = (val: any) =>
    val !== null && val !== undefined && val !== "";

  return (
    <div className="max-w-6xl mx-auto pb-6">
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
          if (propertyData && propertyData._id) handleDelete(propertyData._id);
          setShowConfirmDialog(false);
        }}
        heading="Are you sure?"
        description="This property will be deleted, and this action cannot be undone."
        confirmText="Delete"
        cancelText="Back"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      {/* Header with Back and Actions */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
            <span className="font-medium text-gray-700">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
            <Link href={`/agent/edit-property/${propertyId}`}>
              <button className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all">
                <PencilIcon className="h-5 w-5" />
              </button>
            </Link>
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Image Gallery */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative aspect-[4/3] bg-gray-100">
            {imageLoading && !isVideo(selectedImage?.url || "") && (
              <div className="absolute inset-0 z-10 flex animate-pulse items-center justify-center bg-gray-200">
                <HomeIcon className="h-16 w-16 text-gray-400" />
              </div>
            )}

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
                  className={`object-cover transition-opacity duration-300 ${
                    imageLoading ? "opacity-0" : "opacity-100"
                  }`}
                  priority
                  onLoad={() => setImageLoading(false)}
                />
              )
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <HomeIcon className="h-16 w-16 text-gray-400" />
              </div>
            )}

            {/* Navigation Arrows */}
            {propertyData.images.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-all active:scale-95"
                  onClick={() => {
                    setImageLoading(true);
                    const idx = propertyData.images.findIndex(
                      (img) => img._id === selectedImage?._id
                    );
                    const prevIdx =
                      (idx - 1 + propertyData.images.length) %
                      propertyData.images.length;
                    setSelectedImage(propertyData.images[prevIdx]);
                  }}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-all active:scale-95"
                  onClick={() => {
                    setImageLoading(true);
                    const idx = propertyData.images.findIndex(
                      (img) => img._id === selectedImage?._id
                    );
                    const nextIdx = (idx + 1) % propertyData.images.length;
                    setSelectedImage(propertyData.images[nextIdx]);
                  }}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {propertyData.images.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                {propertyData.images.findIndex(
                  (img) => img._id === selectedImage?._id
                ) + 1}{" "}
                / {propertyData.images.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {propertyData.images.length > 1 && (
            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {propertyData.images.map((image, index) => (
                  <button
                    key={image._id || index}
                    onClick={() => {
                      setImageLoading(true);
                      setSelectedImage(image);
                    }}
                    className={`flex-shrink-0 relative rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage?._id === image._id
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="relative h-14 w-16">
                      {isVideo(image.url) ? (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                          <PlayCircleIcon className="h-5 w-5 text-white" />
                        </div>
                      ) : (
                        <Image
                          src={getImageUrl(image.url)}
                          alt={image.alt || `Thumbnail ${index + 1}`}
                          width={64}
                          height={56}
                          className="object-cover h-full w-full"
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="mb-4">
            <div className="flex items-start justify-between mb-3">
              <h1 className="text-2xl font-bold text-gray-900 pr-2">
                {propertyData.title}
              </h1>
              <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                {propertyData.status}
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-600 mb-4">
              <MapPinIcon className="h-4 w-4" />
              <span className="text-sm">{propertyData.location || "N/A"}</span>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              {hasValue(propertyData.price) &&
                propertyData.price &&
                propertyData.price > 0 && (
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatPrice(propertyData.price)}
                  </div>
                )}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="bg-white px-2 py-1 rounded-lg border border-gray-200 capitalize">
                  {capitalizeFirstLetter(propertyData.type)}
                </span>
                <span className="bg-white px-2 py-1 rounded-lg border border-gray-200">
                  {capitalizeFirstLetter(propertyData.category)}
                </span>
              </div>
            </div>
          </div>

          {/* Key Features Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-gray-100">
            {isResidential && hasValue(propertyData.bedrooms) && (
              <div className="text-center">
                <div className="bg-blue-50 p-2 rounded-xl inline-block mb-1">
                  <BedIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {propertyData.bedrooms}
                </div>
                <div className="text-xs text-gray-500">Beds</div>
              </div>
            )}
            {isResidential && hasValue(propertyData.bathrooms) && (
              <div className="text-center">
                <div className="bg-green-50 p-2 rounded-xl inline-block mb-1">
                  <BathIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {propertyData.bathrooms}
                </div>
                <div className="text-xs text-gray-500">Baths</div>
              </div>
            )}
            {isCommercial && hasValue(propertyData.washrooms) && (
              <div className="text-center">
                <div className="bg-green-50 p-2 rounded-xl inline-block mb-1">
                  <BathIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {propertyData.washrooms}
                </div>
                <div className="text-xs text-gray-500">Washrooms</div>
              </div>
            )}
            {hasValue(propertyData.built_up_area) && (
              <div className="text-center">
                <div className="bg-purple-50 p-2 rounded-xl inline-block mb-1">
                  <SquareIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {propertyData.built_up_area}{" "}
                  <span className="text-xs">{propertyData.unit_area_type}</span>
                </div>
                <div className="text-xs text-gray-500">Area</div>
              </div>
            )}
            {isResidential && hasValue(propertyData.balconies) && (
              <div className="text-center">
                <div className="bg-orange-50 p-2 rounded-xl inline-block mb-1">
                  <HomeIcon className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {propertyData.balconies}
                </div>
                <div className="text-xs text-gray-500">Balcony</div>
              </div>
            )}
          </div>

          {/* Description */}
          {propertyData.description && (
            <div className="mt-4">
              <p className="text-gray-700 leading-relaxed">
                {propertyData.description}
              </p>
            </div>
          )}
        </div>

        {/* Property Details */}
        <InfoCard title="Property Details">
          <div className="space-y-1">
            <DetailItem
              icon={Building}
              label="Property Type"
              value={`${propertyData.type}, ${propertyData.category}`}
            />
            {hasValue(propertyData.property_age) && (
              <DetailItem
                icon={CalendarIcon}
                label="Property Age"
                value={propertyData.property_age}
              />
            )}
            {hasValue(propertyData.furnishing) && (
              <DetailItem
                icon={Armchair}
                label="Furnishing"
                value={propertyData.furnishing}
              />
            )}
            {hasValue(propertyData.flooring_type) && (
              <DetailItem
                icon={Layers}
                label="Flooring"
                value={propertyData.flooring_type}
              />
            )}
            <DetailItem
              icon={Handshake}
              label="Transaction Type"
              value={propertyData.transaction_type}
            />
          </div>
        </InfoCard>

        {/* Area & Dimensions */}
        {(hasValue(propertyData.built_up_area) ||
          hasValue(propertyData.plot_front_area)) && (
          <InfoCard title="Area & Dimensions">
            <div className="space-y-1">
              {hasValue(propertyData.built_up_area) && (
                <DetailItem
                  icon={SquareIcon}
                  label={isPlotOrLand ? "Plot Area" : "Built-up Area"}
                  value={`${propertyData.built_up_area} ${propertyData.unit_area_type}`}
                />
              )}
              {hasValue(propertyData.carpet_area) && !isPlotOrLand && (
                <DetailItem
                  icon={SquareIcon}
                  label="Carpet Area"
                  value={`${propertyData.carpet_area} ${propertyData.unit_area_type}`}
                />
              )}
              {hasValue(propertyData.plot_front_area) && (
                <DetailItem
                  icon={LandPlot}
                  label="Plot Frontage"
                  value={`${propertyData.plot_front_area} ${propertyData.plot_dimension_unit}`}
                />
              )}
              {hasValue(propertyData.plot_depth_area) && (
                <DetailItem
                  icon={LandPlot}
                  label="Plot Depth"
                  value={`${propertyData.plot_depth_area} ${propertyData.plot_dimension_unit}`}
                />
              )}
              {hasValue(propertyData.is_corner_plot) && (
                <DetailItem
                  icon={LandPlot}
                  label="Corner Plot"
                  value={propertyData.is_corner_plot ? "Yes" : "No"}
                />
              )}
            </div>
          </InfoCard>
        )}

        {/* Floor & Configuration (Conditional) */}
        {isPlotOrLand && (
          <InfoCard title="Floor & Configuration">
            <div className="space-y-1">
              {hasValue(propertyData.floor_number) && (
                <DetailItem
                  icon={Layers}
                  label="Floor Number"
                  value={propertyData.floor_number}
                />
              )}
              {hasValue(propertyData.total_floors) && (
                <DetailItem
                  icon={Building}
                  label="Total Floors"
                  value={propertyData.total_floors}
                />
              )}
              {isResidential && hasValue(propertyData.bedrooms) && (
                <DetailItem
                  icon={BedIcon}
                  label="Bedrooms"
                  value={propertyData.bedrooms}
                />
              )}
              {isResidential && hasValue(propertyData.bathrooms) && (
                <DetailItem
                  icon={BathIcon}
                  label="Bathrooms"
                  value={propertyData.bathrooms}
                />
              )}
              {isResidential && hasValue(propertyData.balconies) && (
                <DetailItem
                  icon={HomeIcon}
                  label="Balconies"
                  value={propertyData.balconies}
                />
              )}
            </div>
          </InfoCard>
        )}

        {/* Facing & Overlooking */}
        {(propertyData.facing || propertyData.overlooking?.length) && (
          <InfoCard title="Facing & Overlooking">
            <div className="space-y-1">
              {propertyData.facing && (
                <DetailItem
                  icon={Compass}
                  label="Facing"
                  value={propertyData.facing}
                />
              )}{" "}
              {hasValue(propertyData.overlooking) &&
                propertyData.overlooking &&
                propertyData.overlooking.length > 0 && (
                  <div className="flex items-center gap-3 py-2">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Eye className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Overlooking</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {propertyData.overlooking.map((item, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs capitalize"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </InfoCard>
        )}

        {/* Amenities & Features */}
        {(hasValue(propertyData.amenities) &&
          propertyData.amenities &&
          propertyData?.amenities?.length > 0) ||
          (hasValue(propertyData.features) &&
            propertyData.features &&
            propertyData.features.length > 0 && (
              <InfoCard title="Amenities & Features">
                <div className="space-y-3">
                  {hasValue(propertyData.amenities) &&
                    propertyData.amenities &&
                    propertyData.amenities?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">
                          Amenities
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {propertyData.amenities.map((amenity, index) => (
                            <span
                              key={index}
                              className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm border border-green-100 capitalize"
                            >
                              {capitalizeFirstLetter(amenity)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  {hasValue(propertyData.features) &&
                    propertyData.features?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">
                          Features
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {propertyData.features.map((feature, index) => (
                            <span
                              key={index}
                              className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm border border-purple-100 capitalize"
                            >
                              {capitalizeFirstLetter(feature)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </InfoCard>
            ))}

        {/* Owner Details */}
        {(hasValue(propertyData.owner_name) ||
          hasValue(propertyData.owner_contact)) && (
          <InfoCard title="Owner Details">
            <div className="space-y-1">
              <DetailItem
                icon={UserIcon}
                label="Name"
                value={capitalizeFirstLetter(propertyData.owner_name)}
              />
              <DetailItem
                icon={PhoneIcon}
                label="Contact"
                value={propertyData.owner_contact}
              />
            </div>
          </InfoCard>
        )}

        {/* Additional Info */}
        <InfoCard title="Additional Information">
          <div className="space-y-1">
            {hasValue(propertyData.water_source) &&
              propertyData.water_source &&
              propertyData.water_source?.length > 0 && (
                <div className="flex items-center gap-3 py-2">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <DropletsIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Water Source</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {propertyData.water_source.map((source, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs capitalize"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            {hasValue(propertyData.power_backup) && (
              <DetailItem
                icon={Zap}
                label="Power Backup"
                value={propertyData.power_backup}
              />
            )}
            {hasValue(propertyData.rera_status) && (
              <DetailItem
                icon={Gavel}
                label="RERA Status"
                value={propertyData.rera_status}
              />
            )}
            {hasValue(propertyData.gated_community) && (
              <DetailItem
                icon={Shield}
                label="Gated Community"
                value={propertyData.gated_community}
              />
            )}
          </div>
        </InfoCard>
      </div>
    </div>
  );
};

export default SingleProperty;
