"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  ShareIcon,
  CalendarIcon,
  UserIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { getSharedProperties } from "@/lib/Agent/SharePropertyAPI";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import SharePropertyModal from "../Common/SharePropertyModal";
import SearchInput from "@/components/Common/SearchInput";
import { showErrorToast } from "@/utils/toastHandler";
import { capitalizeFirstLetter } from "@/helper/capitalizeFirstLetter";

export const Shares: React.FC = () => {
  const { user } = useAuth();
  const [sharedData, setSharedData] = useState<SharePropertyFormData[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [propertyToShare, setPropertyToShare] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSharedProperties();
  }, [user?._id]);
  const fetchSharedProperties = async () => {
    try {
      const agencyId = user?._id;
      if (!agencyId) return;
      const response = await getSharedProperties(agencyId);
      if (response.success) {
        setSharedData(response.data);
      }
    } catch (error) {
      showErrorToast("Error fetching shared properties:", error);
    }
  };

 

  const filteredShares = useMemo(() => {
    if (!searchTerm) return sharedData;
    return sharedData.filter((share) => {
      const propertyTitle = share.propertyId?.title.toLowerCase();
      const sharedByName = share.sharedByUserId.name.toLowerCase();
      const sharedWithName = share.sharedWithUserId?.fullName.toLowerCase();
      const term = searchTerm.toLowerCase();
      return (
        propertyTitle?.includes(term) ||
        sharedByName?.includes(term) ||
        sharedWithName?.includes(term)
      );
    });
  }, [searchTerm, sharedData]);

  return (
    <div className="bg-gray-50 p-2 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-row items-start sm:items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Property Shares
          </h1>
          <p className="text-gray-600">Manage property sharing </p>
        </div>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by property or user..."
        />
      </div>

      {/* Shares List */}
      <div className="space-y-2">
        {filteredShares.map((share) => {
          return (
            <article
              key={share._id}
              className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-2 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex md:flex-row flex-col space-y-2 md:space-y-0 items-start justify-between">
                <div className="flex-1 w-full md:w-auto">
                  <div className="flex items-center space-x-3 md:mb-3 mb-2">
                    <div
                      className="p-2 rounded-lg"
                      onClick={() =>
                        setPreviewImage(
                          `${process.env.NEXT_PUBLIC_IMAGE_URL}/Properties/original/${share?.propertyId?.images[0]?.url}`
                        )
                      }>
                      <Image
                        src={
                          share?.propertyId?.images?.length
                            ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/Properties/original/${share.propertyId?.images[0].url}`
                            : "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"
                        }
                        alt={share.propertyId?.title || "N/A"}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover cursor-pointer"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {share.propertyId?.title}
                      </h3>
                      <div className="flex flex-col space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1.5 text-blue-500" />
                          <span>
                            Shared by{" "}
                            <span className="font-medium text-gray-900">
                              {capitalizeFirstLetter(share?.sharedByUserId.name)}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1.5 text-green-500" />
                          <span>
                            Shared with{" "}
                            <span className="font-medium text-gray-900">
                              {capitalizeFirstLetter(share.sharedWithUserId?.fullName)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Shared On</p>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {format(new Date(share.createdAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </div>
               <div >
                <button
                      className="flex items-center text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors"
                      onClick={() => {
                        setPropertyToShare(share?.propertyId);
                        setShowShareModal(true);
                      }}>
                      <ArrowPathIcon className="h-4 w-4 mr-1" /> Re-share
                    </button>
               </div>
                  </div>
                </div>

              
              </div>
            </article>
          );
        })}
      </div>

      {sharedData.length === 0 && (
        <div className="text-center py-16 px-4 bg-white rounded-lg shadow-sm">
          <ShareIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No shares yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start sharing properties with customers and colleagues
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            <ShareIcon className="h-5 w-5 mr-2" />
            Share Your First Property
          </button>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg p-2 max-w-3xl w-full">
            <button
              className="absolute -top-4 -right-4 bg-white text-gray-600 hover:text-red-600 rounded-full p-1.5 shadow-lg"
              onClick={() => setPreviewImage(null)}>
              <XMarkIcon className="h-6 w-6" />
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
            .filter((s) => s.propertyId?._id === propertyToShare?._id)
            .map((s) => s.sharedWithUserId)}
          onClose={() => {
            setShowShareModal(false);
            setPropertyToShare(null);
            fetchSharedProperties();
          }}
        />
      )}
    </div>
  );
};
