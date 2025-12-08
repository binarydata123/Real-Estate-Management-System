"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Phone,
  User,
  BathIcon,
  BedDoubleIcon,
  RulerIcon,
} from "lucide-react";
import { getAgencyById } from "@/lib/Admin/AgencyAPI";
import { showErrorToast } from "@/utils/toastHandler";
import { formatPrice } from "@/utils/helperFunction";
import ScrollPagination from "@/components/Common/ScrollPagination";
import Image from "next/image";
import { getPropertyImageUrlWithFallback, handleImageError } from "@/lib/imageUtils";
import SearchInput from "@/components/Common/SearchInput";

export default function AgencyView({ agencyId }: { agencyId: string }) {
  const [activeTab, setActiveTab] = useState("team-members");
  const [agency, setAgency] = useState<AgencyFormData | null>(null);
  const [teamMembers, setTeamMembers] = useState<UserData[]>([]);
  const [customers, setCustomers] = useState<CustomerFormData[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [meetings, setMeetings] = useState<MeetingFormData[]>([]);
  const [propertyShares, setPropertyShares] = useState<SharedPropertiesFormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembersCurrentPage, setTeamMembersCurrentPage] = useState(1);
  const [teamMembersTotalPages, setTeamMembersTotalPages] = useState(1);
  const [teamMembersTotalRecords, setTeamMembersTotalRecords] = useState(0);
  const [customersCurrentPage, setCustomersCurrentPage] = useState(1);
  const [customersTotalPages, setCustomersTotalPages] = useState(1);
  const [customersTotalRecords, setCustomersTotalRecords] = useState(0);
  const [propertiesCurrentPage, setPropertiesCurrentPage] = useState(1);
  const [propertiesTotalPages, setPropertiesTotalPages] = useState(1);
  const [propertiesTotalRecords, setPropertiesTotalRecords] = useState(0);
  const [meetingsCurrentPage, setMeetingsCurrentPage] = useState(1);
  const [meetingsTotalPages, setMeetingsTotalPages] = useState(1);
  const [meetingsTotalRecords, setMeetingsTotalRecords] = useState(0);

  const [propertySharesCurrentPage, setPropertySharesCurrentPage] = useState(1);
  const [propertySharesTotalPages, setPropertySharesTotalPages] = useState(1);
  const [propertySharesTotalRecords, setPropertySharesTotalRecords] = useState(0);
  const limit = "9";
  const [teamMembersSearchTerm, setTeamMembersSearchTerm] = useState("");
  const [customersSearchTerm, setCustomersSearchTerm] = useState("");
  const [propertiesSearchTerm, setPropertiesSearchTerm] = useState("");
  const [meetingsSearchTerm, setMeetingsSearchTerm] = useState("");
  const [propertySharesSearchTerm, setPropertySharesSearchTerm] = useState("");
  const [debouncedTeamMembersSearchTerm, setDebouncedTeamMembersSearchTerm] = useState("");
  const [debouncedCustomersSearchTerm, setDebouncedCustomersSearchTerm] = useState("");
  const [debouncedPropertiesSearchTerm, setDebouncedPropertiesSearchTerm] = useState("");
  const [debouncedMeetingsSearchTerm, setDebouncedMeetingsSearchTerm] = useState("");
  const [debouncedPropertySharesSearchTerm, setDebouncedPropertySharesSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTeamMembersSearchTerm(teamMembersSearchTerm);
      setDebouncedCustomersSearchTerm(customersSearchTerm);
      setDebouncedPropertiesSearchTerm(propertiesSearchTerm);
      setDebouncedMeetingsSearchTerm(meetingsSearchTerm);
      setDebouncedPropertySharesSearchTerm(propertySharesSearchTerm);
      setTeamMembersCurrentPage(1);
      setCustomersCurrentPage(1);
      setPropertiesCurrentPage(1);
      setMeetingsCurrentPage(1);
      setPropertySharesCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [teamMembersSearchTerm, customersSearchTerm, propertiesSearchTerm, meetingsSearchTerm, propertySharesSearchTerm]);

  const fetchData = useCallback(
    async (page = 1, teamMembersSearch = "", customersSearch = "", propertiesSearch = "", meetingsSearch = "", propertySharesSearch = "", append=false) => {
      try {
        setIsLoading(true);
        const response = await getAgencyById(page, limit, teamMembersSearch, customersSearch, propertiesSearch, meetingsSearch, propertySharesSearch, agencyId);
        if (response.success) {
          setAgency(response.data.agency);
          setTeamMembers((prev) => (append ? [...prev, ...response.data.teamMembers] : response.data.teamMembers));
          setCustomers((prev) => (append ? [...prev, ...response.data.customers] : response.data.customers));
          setProperties((prev) => (append ? [...prev, ...response.data.property] : response.data.property));
          setMeetings((prev) => (append ? [...prev, ...response.data.meetings] : response.data.meetings));
          setPropertyShares((prev) => (append ? [...prev, ...response.data.propertyShare] : response.data.propertyShare));
          setTeamMembersCurrentPage(response.data.teamMembersPagination?.page ?? 1);
          setTeamMembersTotalPages(response.data.teamMembersPagination?.totalPages ?? 1);
          setTeamMembersTotalRecords(response.data.teamMembersPagination?.total ?? 0);
          setCustomersCurrentPage(response.data.customersPagination?.page ?? 1);
          setCustomersTotalPages(response.data.customersPagination?.totalPages ?? 1);
          setCustomersTotalRecords(response.data.customersPagination?.total ?? 0);
          setPropertiesCurrentPage(response.data.propertyPagination?.page ?? 1);
          setPropertiesTotalPages(response.data.propertyPagination?.totalPages ?? 1);
          setPropertiesTotalRecords(response.data.propertyPagination?.total ?? 0);
          setMeetingsCurrentPage(response.data.meetingsPagination?.page ?? 1);
          setMeetingsTotalPages(response.data.meetingsPagination?.totalPages ?? 1);
          setMeetingsTotalRecords(response.data.meetingsPagination?.total ?? 0);
          setPropertySharesCurrentPage(response.data.propertySharePagination?.page ?? 1);
          setPropertySharesTotalPages(response.data.propertySharePagination?.totalPages ?? 1);
          setPropertySharesTotalRecords(response.data.propertySharePagination?.total ?? 0);
        }
      } catch (error) {
        showErrorToast("Failed to fetch customers:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!agencyId) return;
    setTeamMembers([]);
    setCustomers([]);
    setProperties([]);
    setMeetings([]);
    setPropertyShares([]);
    fetchData(1, debouncedTeamMembersSearchTerm, debouncedCustomersSearchTerm, debouncedPropertiesSearchTerm, debouncedMeetingsSearchTerm, debouncedPropertySharesSearchTerm);
  }, [agencyId, fetchData, debouncedTeamMembersSearchTerm, debouncedCustomersSearchTerm, debouncedPropertiesSearchTerm, debouncedMeetingsSearchTerm, debouncedPropertySharesSearchTerm]);

  const formatBudget = (min?: number, max?: number) => {
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  };

  const handleTeamMembersPageChange = (page: number) => {
    if (page >= 1 && page <= teamMembersTotalPages && !isLoading) {
      fetchData(page, debouncedTeamMembersSearchTerm, debouncedCustomersSearchTerm, debouncedPropertiesSearchTerm, debouncedMeetingsSearchTerm, debouncedPropertySharesSearchTerm, true);
    }
  };

  const handleCustomersPageChange = (page: number) => {
    if (page >= 1 && page <= customersTotalPages && !isLoading) {
      fetchData(page, debouncedTeamMembersSearchTerm, debouncedCustomersSearchTerm, debouncedPropertiesSearchTerm, debouncedMeetingsSearchTerm, debouncedPropertySharesSearchTerm, true);
    }
  };
  const handlePropertyPageChange = (page: number) => {
    if (page >= 1 && page <= propertiesTotalPages && !isLoading) {
      fetchData(page, debouncedTeamMembersSearchTerm, debouncedCustomersSearchTerm, debouncedPropertiesSearchTerm, debouncedMeetingsSearchTerm, debouncedPropertySharesSearchTerm, true);
    }
  };
  const handleMeetingsPageChange = (page: number) => {
    if (page >= 1 && page <= meetingsTotalPages && !isLoading) {
      fetchData(page, debouncedTeamMembersSearchTerm, debouncedCustomersSearchTerm, debouncedPropertiesSearchTerm, debouncedMeetingsSearchTerm, debouncedPropertySharesSearchTerm, true);
    }
  };
  const handlePropertySharesPageChange = (page: number) => {
    if (page >= 1 && page <= propertySharesTotalPages && !isLoading) {
      fetchData(page, debouncedTeamMembersSearchTerm, debouncedCustomersSearchTerm, debouncedPropertiesSearchTerm, debouncedMeetingsSearchTerm, debouncedPropertySharesSearchTerm, true);
    }
  };
  return (
    <div className="max-w-7xl mx-auto p-3 lg:p-6">
      {/* Header */}
      <div className="">
        {/* Main Profile */}
        <div className="">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-6">
            <div className="flex items-start space-x-6">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1 capitalize">
                      {agency?.name}
                    </h1>
                    <p className="text-lg text-gray-600 mb-3">
                      {/* {agency.title} */}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{agency?.users?.name}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{agency?.email}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>{agency?.phone}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-3 md:mt-6 md:mb-6 mb-3">
            <div className="flex">
              {[
                { id: "team-members", label: "Team Members" },
                { id: "customers", label: "Customers" },
                { id: "properties", label: "Properties" },
                { id: "meetings", label: "Meetings" },
                { id: "property-share", label: "Property Share" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === tab.id
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
            {activeTab === "team-members" && (
              <>
                <div className="space-y-3 md:space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Team Members
                    </h3>
                    <span className="text-sm text-gray-500">
                      Total Records: {teamMembersTotalRecords}
                    </span>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="search" className="sr-only">
                      Search
                    </label>
                    <SearchInput
                      value={teamMembersSearchTerm}
                      onChange={setTeamMembersSearchTerm}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamMembers && teamMembers.length > 0 ? (
                      teamMembers.map((member, index) => (
                        <div
                          key={index}
                          className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          {/* TOP SECTION */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                              {/* Avatar */}
                              <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-700 shadow-inner">
                                {member.name
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </div>

                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {member.name}
                                </h4>
                                <p className="text-sm text-gray-600">{member.email}</p>
                                {/* <span className="inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                  {member.role || "Member"}
                                </span> */}
                              </div>
                            </div>

                            {/* Status on Right */}
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-medium ${
                                member.status === "active"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {member.status === "active" ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-10">
                        <img
                          src="/nodata.jpg"
                          alt="No Data"
                          className="mx-auto w-40 h-40 object-contain mb-3"
                        />
                        <p className="text-gray-500 text-sm">No team members found.</p>
                      </div>
                    )}
                  </div>
                  <ScrollPagination
                    currentPage={teamMembersCurrentPage}
                    totalPages={teamMembersTotalPages}
                    onPageChange={handleTeamMembersPageChange}
                    isLoading={isLoading}
                    hasMore={teamMembersCurrentPage < teamMembersTotalPages}
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
                </div>
              </>
            )}

            {activeTab === "customers" && (
              <div className="space-y-3 md:space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
                  <span className="text-sm text-gray-500">
                    Total Records: {customersTotalRecords}
                  </span>
                </div>
                <div className="flex-1">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <SearchInput
                    value={customersSearchTerm}
                    onChange={setCustomersSearchTerm}
                    aria-hidden="true"
                  />
                </div>
                {customers && customers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    {customers.map((customer, index) => (
                      <div
                        key={index}
                        className="group bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between">
                          {/* Avatar */}
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-white flex items-center justify-center text-xl font-semibold shadow">
                              {customer.fullName.charAt(0)}
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {customer.fullName}
                              </h4>
                              <p className="text-gray-500 text-sm">{customer.email}</p>
                              <p className="text-gray-500 text-sm">{formatBudget(customer?.minimumBudget || 0, customer?.maximumBudget || 0)}</p>
                            </div>
                          </div>
                          <div>
                            {/* Phone */}
                            <p className="text-sm text-gray-500 border border-gray-200 px-3 py-1 rounded-full">
                              {customer.phoneNumber}
                            </p>
                          </div>
                        </div>
                        {/* WhatsApp */}
                        {/* {customer.whatsAppNumber && (
                          <div className="mt-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="flex text-gray-700 text-sm font-medium p-2">
                              <Phone className="w-4 h-4" /> <span className="text-gray-900 pl-2">{customer.phoneNumber}</span> 
                            </p>
                            <p className="flex text-gray-700 text-sm font-medium p-2">
                              <MessageCircle /> <span className="text-gray-900 pl-2">{customer.whatsAppNumber}</span>
                            </p>
                          </div>
                        )} */}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center mt-10">
                    <img
                      src="/nodata.jpg"
                      alt="No Data"
                      className="mx-auto w-44 h-44 object-contain opacity-80"
                    />
                    <p className="text-gray-500 mt-3 text-lg font-medium">No customers exist.</p>
                  </div>
                )}
                <ScrollPagination
                  currentPage={customersCurrentPage}
                  totalPages={customersTotalPages}
                  onPageChange={handleCustomersPageChange}
                  isLoading={isLoading}
                  hasMore={customersCurrentPage < customersTotalPages}
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
              </div>
            )}

            {activeTab === "properties" && (
              <div className="space-y-3 md:space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Properties</h3>
                  <span className="text-sm text-gray-500">
                    Total Records: {propertiesTotalRecords}
                  </span>
                </div>
                <div className="flex-1">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <SearchInput
                    value={propertiesSearchTerm}
                    onChange={setPropertiesSearchTerm}
                    aria-hidden="true"
                  />
                </div>
                {properties && properties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property, index) => {
                      const primaryImage = property?.images?.length > 0 ? (() => { 
                        const primary = property.images.find((img) => img.isPrimary);
                        return getPropertyImageUrlWithFallback(primary?.url);
                      })() : getPropertyImageUrlWithFallback();
                      return (
                        <div
                          key={index}
                          className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300"
                        >
                          {/* Property Image */}
                          <div className="h-48 w-full bg-gray-100 flex items-center justify-center">
                            <Image
                              width={400}
                              height={200}
                              src={primaryImage}
                              alt={property.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={handleImageError}
                            />
                          </div>

                          {/* Content */}
                          <div className="p-5 space-y-3">
                            {/* Title + Price */}
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                  {property.title}
                                </h3>
                                <p className="text-sm text-gray-500 capitalize">
                                  {property.category} • {property.type}
                                </p>
                              </div>

                              <span className="text-md font-semibold text-primary">
                                ₹{property.price?.toLocaleString()}
                              </span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center text-gray-600 text-sm">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-primary mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M19.5 10c0 7.5-7.5 12-7.5 12S4.5 17.5 4.5 10a7.5 7.5 0 1115 0z"
                                />
                              </svg>
                              {property.location || "Location not updated"}
                            </div>

                            {/* Bedrooms/Bathrooms */}
                            <div className="flex justify-between text-sm text-gray-700">
                              <span><BedDoubleIcon className="w-4 h-4"/> {property.bedrooms} Bed</span>
                              <span><BathIcon className="w-4 h-4"/> {property.bathrooms} Bath</span>
                              <span><RulerIcon className="w-4 h-4"/> {property.built_up_area} sq.ft</span>
                            </div>

                            {/* Extra details grid */}
                            <div className="grid grid-cols-2 gap-2 pt-2 text-sm text-gray-600">
                              <p><span className="font-semibold">Facing:</span> {property.facing}</p>
                              <p><span className="font-semibold">Age:</span> {property.property_age}</p>
                              <p><span className="font-semibold">Furnishing:</span> {property.furnishing}</p>
                              <p><span className="font-semibold">Transaction:</span> {property.transaction_type}</p>
                              <p><span className="font-semibold">RERA:</span> {property.rera_status}</p>
                              <p><span className="font-semibold">Status:</span> 
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs 
                                  ${property.status === "Available"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {property.status}
                                </span>
                              </p>
                            </div>

                            {/* Owner Section */}
                            <div className="pt-4 border-t">
                              <p className="font-semibold text-gray-800">Owner Details</p>
                              {property.owner_name && (<p className="flex text-sm text-gray-600"><User className="w-4 h-4"/> <span className="pl-2">{property.owner_name}</span></p>)}
                              {property.owner_contact && (<p className="flex text-sm text-gray-600"><Phone className="w-4 h-4"/> <span className="pl-2">{property.owner_contact}</span></p>)}
                            </div>

                            {/* View Details Button */}
                            <div className="pt-3">
                              <button className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-dark transition">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center mt-6">
                    <img
                      src="/nodata.jpg"
                      alt="No Data"
                      className="mx-auto w-48 h-48 object-contain"
                    />
                    <p className="text-gray-500 mt-2">No Properties found.</p>
                  </div>
                )}
                <ScrollPagination
                  currentPage={propertiesCurrentPage}
                  totalPages={propertiesTotalPages}
                  onPageChange={handlePropertyPageChange}
                  isLoading={isLoading}
                  hasMore={propertiesCurrentPage < propertiesTotalPages}
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
              </div>
            )}

            {activeTab === "meetings" && (
              <div className="space-y-3 md:space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Meetings</h3>
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
                        const primaryImage = meeting.propertyData?.images?.length > 0 ? (() => { 
                          const primary = meeting.propertyData.images.find((img) => img.isPrimary);
                          return getPropertyImageUrlWithFallback(primary?.url);
                        })() : getPropertyImageUrlWithFallback();
                        return(
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
                                  {meeting.customerData?.fullName || 'N/A'}
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
                                  {meeting.status || 'N/A'}
                                </span>
                              </div>

                              {/* Contact */}
                              <div className="space-y-1 text-sm text-gray-600">
                                {meeting.customerData?.email && (<p>📧 {meeting.customerData?.email}</p>)}
                                {meeting.customerData?.phoneNumber && (<p>📱 {meeting.customerData?.phoneNumber}</p>)}
                              </div>

                              {/* Divider */}
                              <div className="border-t border-gray-200"></div>

                              {/* Property Info */}
                              <div>
                                <h5 className="font-medium text-gray-900">
                                  {meeting.propertyData?.title || 'N/A'}
                                </h5>
                                {meeting.propertyData?.location && (
                                  <p className="text-gray-600 text-sm">
                                    📍 {meeting.propertyData?.location}
                                  </p>
                                )}
                                {meeting.propertyData?.price && (
                                  <p className="text-primary font-semibold text-sm mt-1">
                                    ₹ {meeting.propertyData?.price?.toLocaleString()}
                                  </p>
                                )}
                              </div>

                              {/* Meeting Date/Time */}
                              <div className="flex items-center justify-between pt-3 text-sm">
                                <p className="text-gray-500">
                                  ⏱ {meeting.time} |{" "}
                                    {meeting.date
                                      ? new Date(meeting.date).toLocaleDateString("en-US", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : "N/A"
                                    }
                                </p>
                                {/* <button className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg shadow hover:bg-primary/90 transition">
                                  View Details
                                </button> */}
                              </div>
                            </div>
                          </div>
                        )
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
                </div>
              </div>
            )}

            {activeTab === "property-share" && (
              <div className="space-y-6 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Property Share
                  </h3>
                  <span className="text-sm text-gray-500">Total Records: {propertySharesTotalRecords}</span>
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
                    <p className="text-gray-500 mt-2">No Property Share found.</p>
                  </div>
                )}
                <ScrollPagination
                  currentPage={propertySharesCurrentPage}
                  totalPages={propertySharesTotalPages}
                  onPageChange={handlePropertySharesPageChange}
                  isLoading={isLoading}
                  hasMore={propertySharesCurrentPage < propertySharesTotalPages}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
