"use client";
import React, { useEffect, useState } from "react";
import {
  ShareIcon,
  CalendarIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { getSharedProperties } from "@/lib/Agent/SharePropertyAPI";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import SharePropertyModal from "../Common/SharePropertyModal";

export const Shares: React.FC = () => {
  const { user } = useAuth();
  const [sharedData, setSharedData] = useState<SharePropertyFormData[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [propertyToShare, setPropertyToShare] = useState<Property | null>(null);

  useEffect(() => {
    const fetchSharedProperties = async () => {
      try {
        const agencyId = user?._id;
        if (!agencyId) return;
        const response = await getSharedProperties(agencyId);
        if (response.success) {
          setSharedData(response.data);
        }
      } catch (error) {
        console.error("Error fetching shared properties:", error);
      }
    };

    fetchSharedProperties();
  }, [user?._id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "revoked":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

<<<<<<< HEAD
  const getImageUrl = (url?: string) => {
    const fallbackImage =
      "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg";
    if (!url) {
      return fallbackImage;
    }
    if (url.startsWith("http")) {
      return url; // already a full external URL
    }
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/Properties/original/${url}`;
  };

=======
>>>>>>> d6dd75f8fc3bf16a671d043f1a0fc2dcff61ac1d
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Shares</h1>
          <p className="text-gray-600 md:mt-1">Manage property sharing </p>
        </div>
      </div>

      {/* Shares List */}
      <div className="space-y-2 md:space-y-4">
        {sharedData.map((share) => {
<<<<<<< HEAD
          const imageUrl = getImageUrl(share.propertyId.images?.[0]?.url);
=======
>>>>>>> d6dd75f8fc3bf16a671d043f1a0fc2dcff61ac1d
          return (
            <div
              key={share._id}
              className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-2 md:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex md:flex-row flex-col space-y-2 md:space-y-0 items-start justify-between">
                <div className="flex-1 w-full md:w-auto">
                  <div className="flex items-center space-x-3 md:mb-3 mb-2">
<<<<<<< HEAD
                    <div className="p-2 rounded-lg" onClick={() => setPreviewImage(imageUrl)}>
                      <Image
                        src={imageUrl}
=======
                    <div
                      className="p-2 rounded-lg"
                      onClick={() =>
                        setPreviewImage(
                          `${process.env.NEXT_PUBLIC_IMAGE_URL}/Properties/original/${share?.propertyId?.images[0]?.url}`
                        )
                      }
                    >
                      <Image
                        src={
                          share?.propertyId?.images?.length
                            ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/Properties/original/${share.propertyId.images[0].url}`
                            : "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"
                        }
>>>>>>> d6dd75f8fc3bf16a671d043f1a0fc2dcff61ac1d
                        alt={share.propertyId.title}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {share.propertyId.title}
                      </h3>
                      <div className="flex flex-col space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1.5 text-blue-500" />
                          <span>
                            Shared by{" "}
                            <span className="font-medium text-gray-900">
                              {share.sharedByUserId.name}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1.5 text-green-500" />
                          <span>
                            Shared with{" "}
                            <span className="font-medium text-gray-900">
                              {share.sharedWithUserId.fullName}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Shared On</p>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {format(new Date(share.createdAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col justify-between md:justify-start items-center md:items-end space-y-2 w-full md:w-auto">
                  <span
                    className={`inline-flex items-center px-2 py-1 capitalize rounded-full text-xs font-medium ${getStatusColor(
                      share.status
                    )}`}
                  >
                    {share.status}
                  </span>

                  <div className="flex md:space-x-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Link
                    </button>
                    <button
                      className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      onClick={() => {
                        setPropertyToShare(share?.propertyId);
                        setShowShareModal(true);
                      }}
                    >
                      Re-share
                    </button>
                    {share.status === "active" && (
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sharedData.length === 0 && (
        <div className="text-center py-12">
          <ShareIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No shares yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start sharing properties with customers and colleagues
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <ShareIcon className="h-5 w-5 mr-2" />
            Share Your First Property
          </button>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg p-2">
            <button
              className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 rounded-full p-1.5"
              onClick={() => setPreviewImage(null)}
            >
              <XMarkIcon className="h-6 w-6 text-red-600 hover:text-red-800" />
            </button>

            <Image
              src={previewImage}
              alt="Preview"
              width={600}
              height={400}
              className="rounded-lg object-contain"
            />
          </div>
        </div>
      )}

      {showShareModal && propertyToShare && (
        <SharePropertyModal
          property={propertyToShare}
          sharedCustomers={sharedData
            .filter((s) => s.propertyId._id === propertyToShare._id)
            .map((s) => s.sharedWithUserId)}
          onClose={() => {
            setShowShareModal(false);
            setPropertyToShare(null);
          }}
        />
      )}
    </div>
  );
};
