"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  ShareIcon,
  CalendarIcon,
  UserIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
// import { format } from "date-fns";
import { getSharedProperties } from "@/lib/Agent/SharePropertyAPI";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import SharePropertyModal from "../Common/SharePropertyModal";
import SearchInput from "@/components/Common/SearchInput";
import { showErrorToast } from "@/utils/toastHandler";
import { capitalizeFirstLetter } from "@/helper/capitalizeFirstLetter";
import ScrollPagination from "@/components/Common/ScrollPagination";
import CustomerModal from "@/components/Common/CustomerModal";
import AgentModal from "@/components/Common/AgentModal";

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
  const [open,setOpen] = useState(false);
  const [agentOpen,setAgentOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<SharedWithSchema | null>(null);
  const [viewAgent, setViewAgent] = useState<AgentFormData | null>(null);

  // ⬇ FETCH DATA WITH PAGINATION ⬇
  const fetchSharedProperties = async (page = 1) => {
    try {
      setIsLoading(true);

      const agencyId = user?._id;
      if (!agencyId) return;

      const response = await getSharedProperties(agencyId, page, 10);

      if (response.success) {
        const newItems = response.data; // Array of results
        const pag = response.pagination; // Pagination object

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const StatPill = ({ label, value }: { label: string; value: number }) => (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-[#C9A24D]/30 shadow-[0_0_0_1px_rgba(201,162,77,0.15)]">
      <div className="w-2.5 h-2.5 rounded-full bg-[#C9A24D] shadow-[0_0_8px_rgba(201,162,77,0.8)]" />
      <span className="text-sm text-white/90">
        <span className="font-semibold text-white">{value}</span> {label}
      </span>
    </div>
  );

  const MakeItShorter = (text : string, limit : number) => {
    if (!text) return;
    if (text.length > limit) {
      return `${text.slice(0,limit)}..`
    }
    return text;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] px-1 py-1">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-[8px] mb-4 bg-gradient-to-br from-[#0A2540] via-[#0E2F52] to-[#081C30] border border-[#C9A24D]/20">
        {/* Gold Accent Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C9A24D]/10 blur-3xl rounded-full" />

        <div className="relative z-10 p-5 sm:p-6">
          <div className="max-w-3xl">
            {/* Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white flex items-center gap-2">
                  Property <span className="text-[#C9A24D]">Shares</span>
                </h1>
                <p className="mt-1 text-sm sm:text-base text-white/80">
                  Manage and track all your shared properties
                </p>
              </div>

              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by property or user..."
              />
            </div>

            {/* Divider */}
            <div className="mt-4 mb-5 h-px w-32 bg-gradient-to-r from-[#C9A24D] to-transparent" />

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3">
              <StatPill label="Total Shares" value={sharedData.length} />
              <StatPill
                label="Filtered Results"
                value={filteredShares.length}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shares List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-white/50 animate-pulse"
            />
          ))}
        </div>
      ) : filteredShares.length > 0 ? (
        <div className="space-y-3">
          {filteredShares.map((share) => (
            <article
              key={share._id}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 md:p-6 hover:shadow-xl hover:border-[#C9A24D]/30 transition-all duration-300"
            >
              <div className="flex md:flex-row flex-col space-y-3 md:space-y-0 items-start justify-between">
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between gap-4 md:mb-4 mb-3">
                    {/* Property Image */}
                    <div className="flex items-center gap-1">
                      <div
                        onClick={() =>
                          setPreviewImage(
                            share?.propertyId?.images?.length
                              ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/Properties/original/${share.propertyId?.images[0].url}`
                              : "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
                          )
                        }
                        className="relative w-[68px] h-[68px] rounded-xl overflow-hidden cursor-pointer border border-[#C9A24D]/30 shadow-sm hover:shadow-md transition"
                      >
                        <Image
                          src={
                            share?.propertyId?.images?.length
                              ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/Properties/original/${share.propertyId?.images[0].url}`
                              : "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"
                          }
                          alt={share?.propertyId?.title || "Property"}
                          fill
                          className="object-cover"
                          sizes="68px"
                        />
                      </div>

                      {/* Property & Sharing Info */}
                      <div className="min-w-0">
                        {/* Title */}
                        <h3 className="text-base md:text-lg font-semibold text-[#0A2540] truncate">
                          {share.propertyId?.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium
                   rounded-[8px] bg-[#C9A24D]/15 text-[#0A2540] border border-[#C9A24D]/30"
                          >
                            {capitalizeFirstLetter(
                              share?.propertyId?.furnishing,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
                        <CalendarIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">
                          Shared On
                        </p>
                        <span className="font-semibold text-[#0A2540]">
                          {formatDate(share.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex gap-2">
                    {/* Shared By */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] w-[50%] h-8 bg-[#C9A24D]/10 text-sm">
                      <UserIcon className="h-4 w-4 text-[#C9A24D]" />
                      <span className="text-gray-700">
                        Shared by{" "}
                        <span className="font-semibold text-[#0A2540]" onClick={() => {setViewAgent(share?.sharedByUserId); setAgentOpen(true)}}>
                          {MakeItShorter(capitalizeFirstLetter(share.sharedByUserId.name), 5)}
                        </span>
                      </span>
                    </div>

                    {/* Shared With */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] w-[50%] h-8 bg-[#0A2540]/5 text-sm">
                      <UserIcon className="h-4 w-4 text-[#0A2540]" />
                      <span className="text-gray-700">
                        Shared with{" "}
                        <span className="font-semibold text-[#0A2540]" onClick={() => {setViewCustomer(share?.sharedWithUserId); setOpen(true)}}>
                          {MakeItShorter(capitalizeFirstLetter(
                            share.sharedWithUserId?.fullName,
                          ),4)}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-gray-100">
                    <button
                      className="flex items-center justify-center w-[100%] gap-2 px-3 py-2 bg-[#0A2540] text-[#FFFFFF] hover:from-[#C9A24D]/20 hover:to-[#C9A24D]/10 rounded-lg text-sm font-semibold transition-all duration-200 border border-[#C9A24D]/30 hover:border-[#C9A24D]/40 shadow-sm hover:shadow text-center"
                      onClick={() => {
                        setPropertyToShare(share.propertyId);
                        setShowShareModal(true);
                      }}
                    >
                      <ArrowPathIcon className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                      Re-share Property
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="w-20 h-20 mb-4 rounded-full bg-[#F5F7FA] flex items-center justify-center">
            <ShareIcon className="h-10 w-10 text-[#0A2540]" />
          </div>
          <h3 className="text-xl font-bold text-[#0A2540] mb-2">
            {searchTerm ? "No matching shares found" : "No shares yet"}
          </h3>
          <p className="text-gray-600 mb-3 text-center max-w-md">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Start sharing properties with customers and colleagues"}
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
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-[#C9A24D]/20 border-t-[#C9A24D] rounded-full mx-auto animate-spin" />
          </div>
        }
        endMessage={
          <div className="text-center py-8 text-[#C9A24D] font-semibold text-lg">
            🎉 All caught up!
          </div>
        }
      />

      <CustomerModal
              open={open}
              onClose={() => setOpen(false)}
              customer={viewCustomer}
            />

      <AgentModal
              open={agentOpen}
              onClose={() => setAgentOpen(false)}
              agent={viewAgent}
            />

      {/* Preview Image Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-2xl p-3 max-w-3xl w-full shadow-2xl">
            <button
              className="absolute -top-4 -right-4 bg-white text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full p-2 shadow-lg transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <img
              src={previewImage}
              alt="Preview"
              className="rounded-xl object-contain w-full max-h-[80vh]"
            />
          </div>
        </div>
      )}

      {/* Share Modal Placeholder */}
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
