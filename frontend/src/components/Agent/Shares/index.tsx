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
import ScrollPagination from "@/components/Common/ScrollPagination";

export const Shares: React.FC = () => {
  const { user } = useAuth();

  // State
  const [sharedData, setSharedData] = useState<SharePropertyFormData[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [propertyToShare, setPropertyToShare] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // ⬇ FETCH DATA WITH PAGINATION ⬇
  const fetchSharedProperties = async (page = 1) => {
    try {
      setIsLoading(true);

      const agencyId = user?._id;
      if (!agencyId) return;

      const response = await getSharedProperties(agencyId, page, 10);

      if (response.success) {
        const newItems = response.data;          // Array of results
        const pag = response.pagination;         // Pagination object

        if (page === 1) {
          setSharedData(newItems);
        } else {
          setSharedData((prev) => [...prev, ...newItems]);
        }

        setTotalPages(pag?.totalPages || 1);
        setHasMore(page < (pag?.totalPages || 1));
      }
    } catch (error) {
      showErrorToast("Error fetching shared properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ⬇ LOAD FIRST PAGE WHEN USER CHANGES ⬇
  useEffect(() => {
    if (!user?._id) return;
    setCurrentPage(1);
    fetchSharedProperties(1);
  }, [user?._id]);

  // ⬇ FUNCTION PASSED TO ScrollPagination ⬇
  const handlePageChange = (nextPage: number) => {
    setCurrentPage(nextPage);
    fetchSharedProperties(nextPage);
  };

  // ⬇ SEARCH FILTERING (client side) ⬇
  const filteredShares = useMemo(() => {
    if (!searchTerm) return sharedData;

    const term = searchTerm.toLowerCase();

    return sharedData.filter((share) => {
      const propertyTitle = share.propertyId?.title.toLowerCase();
      const sharedByName = share.sharedByUserId.name.toLowerCase();
      const sharedWithName = share.sharedWithUserId?.fullName?.toLowerCase();
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
          <p className="text-gray-600">Manage property sharing</p>
        </div>

        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by property or user..."
        />
      </div>

      {/* Shares List */}
      {isLoading ? (
        <div className="bg-white shadow-sm flex flex-col gap-2 rounded-[3px] w-full h-full p-4">
          {Array.from({ length:20 }).map((_,i) => (
            <div key={i} className="w-full bg-gray-200 rounded h-[80px]"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
        {filteredShares?.map((share) => (
          <article
            key={share._id}
            className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-2 md:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex md:flex-row flex-col space-y-2 md:space-y-0 items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 md:mb-3 mb-2">
                  <div className="p-2 rounded-lg"
                    onClick={() =>
                      setPreviewImage(
                        `${process.env.NEXT_PUBLIC_IMAGE_URL}/Properties/original/${share?.propertyId?.images[0]?.url}`
                      )
                    }
                  >
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
                        <UserIcon className="h-4 w-4 mr-1.5 text-primary" />
                        <span>
                          Shared by{" "}
                          <span className="font-medium">
                            {capitalizeFirstLetter(share.sharedByUserId.name)}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-1.5 text-green-500" />
                        <span>
                          Shared with{" "}
                          <span className="font-medium">
                            {capitalizeFirstLetter(
                              share.sharedWithUserId?.fullName
                            )}
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

                  <button
                    className="flex items-center text-orange-600 hover:text-orange-800 text-sm font-medium"
                    onClick={() => {
                      setPropertyToShare(share.propertyId);
                      setShowShareModal(true);
                    }}
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-1" /> Re-share
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      )}

      {/* No Shares */}
      {sharedData.length === 0 && !isLoading && (
        <div className="text-center py-16 px-4 bg-white rounded-lg shadow-sm">
          <ShareIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No shares yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start sharing properties with customers and colleagues
          </p>
        </div>
      )}

      {/* Infinite Scroll Loader */}
      <ScrollPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        hasMore={hasMore}
        loader={
          <div className="text-center py-4">
            <div className="loader border-t-4 border-b-4 border-primary w-12 h-12 rounded-full mx-auto animate-spin mb-4"></div>
          </div>
        }
      />

      {/* Preview Image Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg p-2 max-w-3xl w-full">
            <button
              className="absolute -top-4 -right-4 bg-white text-gray-600 hover:text-red-600 rounded-full p-1.5 shadow-lg"
              onClick={() => setPreviewImage(null)}
            >
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

      {/* Share Modal */}
      {showShareModal && propertyToShare && (
        <SharePropertyModal
          property={propertyToShare}
          sharedCustomers={sharedData
            .filter((s) => s.propertyId?._id === propertyToShare?._id)
            .map((s) => s.sharedWithUserId)}
          onClose={() => {
            setShowShareModal(false);
            setPropertyToShare(null);
            fetchSharedProperties(1); // refresh page 1\

          }}
        />
      )}
    </div>
  );
};
