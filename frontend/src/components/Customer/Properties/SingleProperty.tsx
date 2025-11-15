/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { getSinglePropertyDetail } from "@/lib/Customer/PropertyAPI";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { showErrorToast } from "@/utils/toastHandler";
import PropertyVoiceAgent from "@/components/Common/PropertyVoiceAgent";

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
  // const [selectedImage, setSelectedImage] = useState<Images>(
  //   propertyData.images[0]
  // );
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<PropertyImage | null>(
    null
  );
  const [propertyData, setPropertyData] = useState<Property | null>(null);

  useEffect(() => {
    getProperty();
  }, [propertyId]);

  const getProperty = useCallback(async () => {
    try {
      if (propertyId) {
        const id = Array.isArray(propertyId) ? propertyId[0] : propertyId;
        const response = await getSinglePropertyDetail(id);
        const data = response.data;
        setPropertyData(data);
        const primaryImg =
          data.images.find((img: Images) => img.isPrimary) ||
          data.images[0] ||
          null;
        setSelectedImage(primaryImg);
      } else {
        setPropertyData(null);
        setSelectedImage(null);
      }
    } catch (err) {
      showErrorToast("Failed to fetch property details", err);
    }
  }, [propertyId]);

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/Properties/original/${url}`;
  };
  return (
    <div className="max-w-6xl mx-auto ">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Properties</span>
        </button>
      </div>
      <div className="p-6 bg-white shadow-lg rounded-xl">
        {/* Main Image */}

        <div className="mb-4 relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px]">
          {selectedImage?.url ? (
            <Image
              src={getImageUrl(selectedImage.url)}
              alt={selectedImage.alt || propertyData?.title || "Property Image"}
              fill
              className="rounded-lg border-4 border-blue-500 object-cover"
              priority={true}
            />
          ) : (
            <Image
              src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"
              alt="Default Property Image"
              fill
              className="rounded-lg border-4 border-blue-500 object-cover"
              priority={true}
            />
          )}

          {/* Prev Button */}
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded"
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
            ❮
          </button>

          {/* Next Button */}
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded"
            onClick={() => {
              if (!propertyData?.images?.length || !selectedImage) return;
              const idx = propertyData.images.findIndex(
                (img) => img._id === selectedImage._id
              );
              const nextIdx = (idx + 1) % propertyData.images.length;
              setSelectedImage(propertyData.images[nextIdx]);
            }}
          >
            ❯
          </button>
        </div>

        {/* Basic Info */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            {propertyData?.title}
          </h1>

          {/* AI Assistant Section */}
          {propertyData?._id && (
            <PropertyVoiceAgent propertyId={propertyData._id} />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
            <p>
              Type:{" "}
              <span className="font-semibold text-gray-800">
                {propertyData?.type}
              </span>
            </p>
            <p>
              Category:{" "}
              <span className="font-semibold text-gray-800">
                {propertyData?.category}
              </span>
            </p>
            <p>
              Location:{" "}
              <span className="font-semibold text-gray-800">
                {propertyData?.location}
              </span>
            </p>
            <p>
              Price:{" "}
              <span className="font-semibold text-gray-800">
                ₹{propertyData?.price}
              </span>
            </p>
            <p>
              Status:{" "}
              <span className="font-semibold text-gray-800">
                {propertyData?.status}
              </span>
            </p>
          </div>
          <p className="text-gray-700 mt-4">{propertyData?.description}</p>
        </div>

        {/* Area & Configuration */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            Area & Configuration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
            <p>
              Built-up Area: {propertyData?.built_up_area}{" "}
              {propertyData?.unit_area_type}
            </p>
            <p>
              Carpet Area: {propertyData?.carpet_area}{" "}
              {propertyData?.unit_area_type}
            </p>
            {propertyData?.plot_front_area && (
              <p>
                Plot Front: {propertyData.plot_front_area}{" "}
                {propertyData.plot_dimension_unit}
              </p>
            )}
            {propertyData?.plot_depth_area && (
              <p>
                Plot Depth: {propertyData.plot_depth_area}{" "}
                {propertyData.plot_dimension_unit}
              </p>
            )}
            {propertyData?.is_corner_plot && (
              <p>Corner Plot: {propertyData?.is_corner_plot}</p>
            )}
            <p>Bedrooms: {propertyData?.bedrooms}</p>
            <p>Bathrooms: {propertyData?.bathrooms}</p>
            <p>Balconies: {propertyData?.balconies}</p>
            <p>Floor Number: {propertyData?.floor_number}</p>
            <p>Total Floors: {propertyData?.total_floors}</p>
          </div>
        </div>

        {/* Facing & Overlooking */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            Facing & Overlooking
          </h2>
          <p className="text-gray-700">Facing: {propertyData?.facing}</p>
          <p className="text-gray-700">
            Overlooking: {propertyData?.overlooking?.join(", ")}
          </p>
        </div>

        {/* Additional Info */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            Additional Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
            <p>Property Age: {propertyData?.property_age}</p>
            <p>Transaction Type: {propertyData?.transaction_type}</p>
            <p>
              Gated Community:{" "}
              {propertyData?.gated_community
                ? propertyData?.gated_community
                : "No"}
            </p>
            <p>Furnishing: {propertyData?.furnishing}</p>
            <p>Flooring Type: {propertyData?.flooring_type}</p>
            <p>Amenities: {propertyData?.amenities?.join(", ")}</p>
            <p>Features: {propertyData?.features?.join(", ")}</p>
            <p>Water Source: {propertyData?.water_source?.join(", ")}</p>
            <p>Power Backup: {propertyData?.power_backup}</p>
            <p>RERA Status: {propertyData?.rera_status}</p>
          </div>
        </div>

        {/* Owner Details */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            Owner Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
            <p>Name: {propertyData?.owner_name}</p>
            <p>Contact: {propertyData?.owner_contact}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProperty;
