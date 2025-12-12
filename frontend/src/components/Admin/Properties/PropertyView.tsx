"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  // ArrowLeft,
  //Mail,
  //Phone,
  User,
  // BathIcon,
  // BedDoubleIcon,
  // RulerIcon,
} from "lucide-react";
import { getPropertyById } from "@/lib/Admin/PropertyAPI";
import { showErrorToast } from "@/utils/toastHandler";
//import { formatPrice } from "@/utils/helperFunction";
import ScrollPagination from "@/components/Common/ScrollPagination";
import Image from "next/image";
import { getPropertyImageUrlWithFallback, handleImageError } from "@/lib/imageUtils";
import SearchInput from "@/components/Common/SearchInput";

export default function PropertyView({ propertyId }: { propertyId: string }) {
  const [activeTab, setActiveTab] = useState("property-share");
  const [property, setProperty] = useState<Property | null>(null);
  // const [customers, setCustomers] = useState<CustomerFormData[]>([]);
  const [meetings, setMeetings] = useState<MeetingFormData[]>([]);
  const [propertyShares, setPropertyShares] = useState<SharedPropertiesFormData[]>([]);
  const [propertyFeedbacks, setPropertyFeedbacks] = useState<PropertyFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meetingsCurrentPage, setMeetingsCurrentPage] = useState(1);
  const [meetingsTotalPages, setMeetingsTotalPages] = useState(1);
  const [meetingsTotalRecords, setMeetingsTotalRecords] = useState(0);
  const [propertySharesCurrentPage, setPropertySharesCurrentPage] = useState(1);
  const [propertySharesTotalPages, setPropertySharesTotalPages] = useState(1);
  const [propertySharesTotalRecords, setPropertySharesTotalRecords] = useState(0);
  const [propertyFeedbacksCurrentPage, setPropertyFeedbacksCurrentPage] = useState(1);
  const [propertyFeedbacksTotalPages, setPropertyFeedbacksTotalPages] = useState(1);
  const [propertyFeedbacksTotalRecords, setPropertyFeedbacksTotalRecords] = useState(0);
  const limit = "9";
  // const [customersSearchTerm, setCustomersSearchTerm] = useState("");
  const [meetingsSearchTerm, setMeetingsSearchTerm] = useState("");
  const [propertySharesSearchTerm, setPropertySharesSearchTerm] = useState("");
  const [propertyFeedbacksSearchTerm, setPropertyFeedbacksSearchTerm] = useState("");
  // const [debouncedCustomersSearchTerm, setDebouncedCustomersSearchTerm] = useState("");
  const [debouncedMeetingsSearchTerm, setDebouncedMeetingsSearchTerm] = useState("");
  const [debouncedPropertySharesSearchTerm, setDebouncedPropertySharesSearchTerm] = useState("");
  const [debouncedPropertyFeedbacksSearchTerm, setDebouncedPropertyFeedbacksSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMeetingsSearchTerm(meetingsSearchTerm);
      setDebouncedPropertySharesSearchTerm(propertySharesSearchTerm);
      setDebouncedPropertyFeedbacksSearchTerm(propertyFeedbacksSearchTerm);
      //setCustomersCurrentPage(1);
      setMeetingsCurrentPage(1);
      setPropertySharesCurrentPage(1);
      setPropertyFeedbacksCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [
    //customersSearchTerm, 
    meetingsSearchTerm,
    propertySharesSearchTerm,
    propertyFeedbacksSearchTerm
  ]);

  const fetchData = useCallback(
    async (
      page = 1,
      //customersSearch = "", 
      meetingsSearch = "",
      propertyShareSearch = "",
      propertyFeedbackSearch = "",
      append = false
    ) => {
      try {
        setIsLoading(true);
        const response = await getPropertyById(
          page, limit,
          //customersSearch, 
          meetingsSearch,
          propertyShareSearch,
          propertyFeedbackSearch,
          propertyId
        );

        if (response.success) {
          setProperty(response.data.property);
          setMeetings((prev) => (append ? [...prev, ...response.data.meetings] : response.data.meetings));
          setPropertyShares((prev) => (append ? [...prev, ...response.data.propertyShare] : response.data.propertyShare));
          setPropertyFeedbacks((prev) => (append ? [...prev, ...response.data.propertyFeedback] : response.data.propertyFeedback));
          setMeetingsCurrentPage(response.data.meetingsPagination?.page ?? 1);
          setMeetingsTotalPages(response.data.meetingsPagination?.totalPages ?? 1);
          setMeetingsTotalRecords(response.data.meetingsPagination?.total ?? 0);
          setPropertySharesCurrentPage(response.data.propertySharePagination?.page ?? 1);
          setPropertySharesTotalPages(response.data.propertySharePagination?.totalPages ?? 1);
          setPropertySharesTotalRecords(response.data.propertySharePagination?.total ?? 0);
          setPropertyFeedbacksCurrentPage(response.data.propertyFeedbacksPagination?.page ?? 1);
          setPropertyFeedbacksTotalPages(response.data.propertyFeedbacksPagination?.totalPages ?? 1);
          setPropertyFeedbacksTotalRecords(response.data.propertyFeedbacksPagination?.total ?? 0);
        }
      } catch (error) {
        showErrorToast("Failed to fetch properties:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // const router = useRouter();

  useEffect(() => {
    if (!propertyId) return;
    setMeetings([]);
    setPropertyShares([]);
    setPropertyFeedbacks([]);
    fetchData(
      1,
      //debouncedCustomersSearchTerm, 
      debouncedMeetingsSearchTerm,
      debouncedPropertySharesSearchTerm,
      debouncedPropertyFeedbacksSearchTerm
    );
  }, [
    propertyId,
    fetchData,
    //debouncedCustomersSearchTerm, 
    debouncedMeetingsSearchTerm,
    debouncedPropertySharesSearchTerm,
    debouncedPropertyFeedbacksSearchTerm
  ]);

  const handleMeetingsPageChange = (page: number) => {
    if (page >= 1 && page <= meetingsTotalPages && !isLoading) {
      fetchData(
        page,
        //debouncedCustomersSearchTerm, 
        debouncedMeetingsSearchTerm,
        debouncedPropertySharesSearchTerm,
        debouncedPropertyFeedbacksSearchTerm,
        true
      );
    }
  };
  const handlePropertySharesPageChange = (page: number) => {
    if (page >= 1 && page <= propertySharesTotalPages && !isLoading) {
      fetchData(
        page,
        //debouncedCustomersSearchTerm, 
        debouncedMeetingsSearchTerm,
        debouncedPropertySharesSearchTerm,
        debouncedPropertyFeedbacksSearchTerm,
        true
      );
    }
  };
  const handlePropertyFeedbacksPageChange = (page: number) => {
    if (page >= 1 && page <= propertyFeedbacksTotalPages && !isLoading) {
      fetchData(
        page,
        //debouncedCustomersSearchTerm, 
        debouncedMeetingsSearchTerm,
        debouncedPropertySharesSearchTerm,
        debouncedPropertyFeedbacksSearchTerm, true
      );
    }
  };
  return (
    <div className="max-w-7xl mx-auto p-3 lg:p-6">
      {/* Header */}
      <div className="">
        {/* Main Profile */}
        <div className="">
          {/* <div className="p-2 w-8 rounded-4xl bg-blue-500 text-white" onClick={() => router.back()}>
            <ArrowLeft />
          </div> */}
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-6">
            <div className="flex items-start space-x-6">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1 capitalize">
                      {property?.title}
                    </h1>
                    <p className="text-lg text-gray-600 mb-3">
                      {/* {agency.title} */}
                    </p>
                    {property?.owner_name && (
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{property.owner_name}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-3 md:mt-6 md:mb-6 mb-3">
            <div className="flex">
              {[
                // { id: "customers", label: "Customers" },
                { id: "property-share", label: "Property Share" },
                { id: "property-feedback", label: "Property Feedback" },
                { id: "meetings", label: "Meetings" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary border-b-2 border-primary"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-6">
            {activeTab === "property-share" && (
              <div className="space-y-6 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Property Share
                  </h3>
                  <span className="text-sm text-gray-500">
                    Total Records: {propertySharesTotalRecords}
                  </span>
                </div>
                <div className="flex-1">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <SearchInput
                    value={propertySharesSearchTerm}
                    onChange={setPropertySharesSearchTerm}
                    aria-hidden="true"
                  />
                </div>
                {propertyShares && propertyShares.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {propertyShares.map((propertyShare, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg md:p-4 p-2 space-y-2"
                      >
                        <h4 className="text-md font-semibold text-gray-900">
                          {propertyShare.propertyId.title}
                        </h4>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {propertyShare.propertyId.description}
                        </p>
                        <p className="text-sm text-gray-500 font-semibold font-medium">
                          Year: {propertyShare.propertyId.createdAt}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center mt-6">
                    <img
                      src="/nodata.jpg"
                      alt="No Data"
                      className="mx-auto w-48 h-48 object-contain"
                    />
                    <p className="text-gray-500 mt-2">
                      No Property Share found.
                    </p>
                  </div>
                )}
                {propertySharesTotalRecords > 0 && (
                  <ScrollPagination
                    currentPage={propertySharesCurrentPage}
                    totalPages={propertySharesTotalPages}
                    onPageChange={handlePropertySharesPageChange}
                    isLoading={isLoading}
                    hasMore={
                      propertySharesCurrentPage < propertySharesTotalPages
                    }
                    loader={
                      <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    }
                    endMessage={
                      <div className="text-center py-8 text-green-600 font-medium">
                        🎉 All caught up!
                      </div>
                    }
                  />
                )}
              </div>
            )}
            {activeTab === "property-feedback" && (
              <div className="space-y-6 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Property Feedback
                  </h3>
                  <span className="text-sm text-gray-500">
                    Total Records: {propertyFeedbacksTotalRecords}
                  </span>
                </div>
                <div className="flex-1">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <SearchInput
                    value={propertyFeedbacksSearchTerm}
                    onChange={setPropertyFeedbacksSearchTerm}
                    aria-hidden="true"
                  />
                </div>
                {propertyFeedbacks && propertyFeedbacks.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {propertyFeedbacks.map((propertyFeedback, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg md:p-4 p-2 space-y-2"
                      >
                        <h4 className="text-md font-semibold text-gray-900">
                          {propertyFeedback.propertyId?.title}
                        </h4>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {propertyFeedback.propertyId?.description}
                        </p>
                        <p className="text-sm text-gray-500 font-semibold font-medium">
                          Year: {propertyFeedback.propertyId?.createdAt}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center mt-6">
                    <img
                      src="/nodata.jpg"
                      alt="No Data"
                      className="mx-auto w-48 h-48 object-contain"
                    />
                    <p className="text-gray-500 mt-2">
                      No Property Feedbacks found.
                    </p>
                  </div>
                )}
                {propertyFeedbacksTotalRecords > 0 && (
                  <ScrollPagination
                    currentPage={propertyFeedbacksCurrentPage}
                    totalPages={propertyFeedbacksTotalPages}
                    onPageChange={handlePropertyFeedbacksPageChange}
                    isLoading={isLoading}
                    hasMore={
                      propertyFeedbacksCurrentPage < propertyFeedbacksTotalPages
                    }
                    loader={
                      <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    }
                    endMessage={
                      <div className="text-center py-8 text-green-600 font-medium">
                        🎉 All caught up!
                      </div>
                    }
                  />
                )}
              </div>
            )}
            {activeTab === "meetings" && (
              <div className="space-y-3 md:space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Meetings
                  </h3>
                  <span className="text-sm text-gray-500">
                    Total Records: {meetingsTotalRecords}
                  </span>
                </div>
                <div className="flex-1">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <SearchInput
                    value={meetingsSearchTerm}
                    onChange={setMeetingsSearchTerm}
                    aria-hidden="true"
                  />
                </div>
                <div className="">
                  {meetings && meetings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {meetings.map((meeting, index) => {
                        const primaryImage =
                          meeting.propertyData?.images?.length > 0
                            ? (() => {
                                const primary =
                                  meeting.propertyData.images.find(
                                    (img) => img.isPrimary
                                  );
                                return getPropertyImageUrlWithFallback(
                                  primary?.url
                                );
                              })()
                            : getPropertyImageUrlWithFallback();
                        return (
                          <div
                            key={index}
                            className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                          >
                            {/* Property Image */}
                            <div className="h-40 w-full overflow-hidden">
                              <Image
                                width={400}
                                height={200}
                                src={primaryImage}
                                alt={meeting.propertyData?.title}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={handleImageError}
                              />
                            </div>

                            <div className="p-5 space-y-4">
                              {/* Customer Info */}
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {meeting.customerData?.fullName || "N/A"}
                                </h4>

                                <span
                                  className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                                    meeting.status === "completed"
                                      ? "bg-green-100 text-green-700"
                                      : meeting.status === "cancelled"
                                      ? "bg-red-100 text-red-600"
                                      : meeting.status === "rescheduled"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {meeting.status || "N/A"}
                                </span>
                              </div>

                              {/* Contact */}
                              <div className="space-y-1 text-sm text-gray-600">
                                {meeting.customerData?.email && (
                                  <p>
                                    <a
                                      href={`mailto:${meeting.customerData.email}`}
                                      className="hover:underline"
                                    >
                                      📧 {meeting.customerData.email}
                                    </a>
                                  </p>
                                )}
                                {meeting.customerData?.phoneNumber && (
                                  <p>
                                    <a href= {`tel:${meeting.customerData.phoneNumber}`}>
                                      📱 {meeting.customerData?.phoneNumber}
                                    </a>
                                  </p>
                                )}
                              </div>

                              {/* Divider */}
                              <div className="border-t border-gray-200"></div>

                              {/* Property Info */}
                              <div>
                                <h5 className="font-medium text-gray-900">
                                  {meeting.propertyData?.title || "N/A"}
                                </h5>
                                {meeting.propertyData?.location && (
                                  <p className="text-gray-600 text-sm">
                                    📍 {meeting.propertyData?.location}
                                  </p>
                                )}
                                {meeting.propertyData?.price && (
                                  <p className="text-primary font-semibold text-sm mt-1">
                                    ₹{" "}
                                    {meeting.propertyData?.price?.toLocaleString()}
                                  </p>
                                )}
                              </div>

                              {/* Meeting Date/Time */}
                              <div className="flex items-center justify-between pt-3 text-sm">
                                <p className="text-gray-500">
                                  ⏱ {meeting.time} |{" "}
                                  {meeting.date
                                    ? new Date(meeting.date).toLocaleDateString(
                                        "en-US",
                                        {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        }
                                      )
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center mt-6">
                      <img
                        src="/nodata.jpg"
                        alt="No Data"
                        className="mx-auto w-48 h-48 object-contain"
                      />
                      <p className="text-gray-500 mt-2">No Meetings found.</p>
                    </div>
                  )}
                  {meetingsTotalRecords > 0 && (
                    <ScrollPagination
                      currentPage={meetingsCurrentPage}
                      totalPages={meetingsTotalPages}
                      onPageChange={handleMeetingsPageChange}
                      isLoading={isLoading}
                      hasMore={meetingsCurrentPage < meetingsTotalPages}
                      loader={
                        <div className="text-center py-4">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      }
                      endMessage={
                        <div className="text-center py-8 text-green-600 font-medium">
                          🎉 All caught up!
                        </div>
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
