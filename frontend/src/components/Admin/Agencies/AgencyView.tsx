 "use client";
 import React, { useState, useEffect, useCallback } from "react";
 import {
   Mail,
   Phone,
   User,
   BathIcon,
   BedDoubleIcon,
   RulerIcon,
   MapPin,
   Home,
   CalendarCheck,
   DollarSign,
   Clock,
   MessageSquare,
   Loader2,
   Calendar,
   Search,
 } from "lucide-react";
 import { getAgencyById } from "@/lib/Admin/AgencyAPI";
 import { showErrorToast } from "@/utils/toastHandler";
 import { formatPrice } from "@/utils/helperFunction";
 import ScrollPagination from "@/components/Common/ScrollPagination";
 import Image from "next/image";
 import {
   getPropertyImageUrlWithFallback,
   handleImageError,
 } from "@/lib/imageUtils";

 // ==========================================
 // SearchInput Component (Fixed)
 // ==========================================
 interface SearchInputProps {
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
 }

 const SearchInput = ({
   value,
   onChange,
   placeholder = "Search...",
 }: SearchInputProps) => (
   <div className="relative w-full">
     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
       <Search className="h-5 w-5 text-gray-400" />
     </div>
     <input
       type="text"
       placeholder={placeholder}
       value={value || ""}
       onChange={(e) => onChange(e.target.value)}
       className="w-full max-w-lg pl-10 pr-4 p-3 rounded-xl border border-gray-300 shadow-sm 
                 focus:outline-none
                 focus:border-blue-500
                 focus:ring-2
                 focus:ring-blue-500
                 focus:ring-opacity-50
                 transition-all duration-200
                 dark:bg-gray-700 dark:border-gray-600 dark:text-white 
                 dark:focus:border-blue-400 dark:focus:ring-blue-400
                 placeholder:text-gray-400 dark:placeholder:text-gray-500"
     />
   </div>
 );

 // ==========================================
 // Main Component
 // ==========================================
 export default function AgencyView({ agencyId }: { agencyId: string }) {
   const [activeTab, setActiveTab] = useState("team-members");
   const [agency, setAgency] = useState<AgencyFormData | null>(null);
   const [teamMembers, setTeamMembers] = useState<UserData[]>([]);
   const [customers, setCustomers] = useState<CustomerFormData[]>([]);
   const [properties, setProperties] = useState<Property[]>([]);
   const [meetings, setMeetings] = useState<MeetingFormData[]>([]);
   const [propertyShares, setPropertyShares] = useState<
     SharedPropertiesFormData[]
   >([]);
   const [isLoading, setIsLoading] = useState(true);

   // Pagination states
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
   const [propertySharesCurrentPage, setPropertySharesCurrentPage] =
     useState(1);
   const [propertySharesTotalPages, setPropertySharesTotalPages] = useState(1);
   const [propertySharesTotalRecords, setPropertySharesTotalRecords] =
     useState(0);

   const limit = "9";

   // Search states
   const [teamMembersSearchTerm, setTeamMembersSearchTerm] = useState("");
   const [customersSearchTerm, setCustomersSearchTerm] = useState("");
   const [propertiesSearchTerm, setPropertiesSearchTerm] = useState("");
   const [meetingsSearchTerm, setMeetingsSearchTerm] = useState("");
   const [propertySharesSearchTerm, setPropertySharesSearchTerm] = useState("");

   // Debounced search states
   const [debouncedTeamMembersSearchTerm, setDebouncedTeamMembersSearchTerm] =
     useState("");
   const [debouncedCustomersSearchTerm, setDebouncedCustomersSearchTerm] =
     useState("");
   const [debouncedPropertiesSearchTerm, setDebouncedPropertiesSearchTerm] =
     useState("");
   const [debouncedMeetingsSearchTerm, setDebouncedMeetingsSearchTerm] =
     useState("");
   const [
     debouncedPropertySharesSearchTerm,
     setDebouncedPropertySharesSearchTerm,
   ] = useState("");


   // Team Members debounce
   useEffect(() => {
     const handler = setTimeout(() => {
       setDebouncedTeamMembersSearchTerm(teamMembersSearchTerm);
       setTeamMembersCurrentPage(1);
     }, 400);
     return () => clearTimeout(handler);
   }, [teamMembersSearchTerm]);

   // Customers debounce
   useEffect(() => {
     const handler = setTimeout(() => {
       setDebouncedCustomersSearchTerm(customersSearchTerm);
       setCustomersCurrentPage(1);
     }, 400);
     return () => clearTimeout(handler);
   }, [customersSearchTerm]);

   // Properties debounce
   useEffect(() => {
     const handler = setTimeout(() => {
       setDebouncedPropertiesSearchTerm(propertiesSearchTerm);
       setPropertiesCurrentPage(1);
     }, 400);
     return () => clearTimeout(handler);
   }, [propertiesSearchTerm]);

   // Meetings debounce
   useEffect(() => {
     const handler = setTimeout(() => {
       setDebouncedMeetingsSearchTerm(meetingsSearchTerm);
       setMeetingsCurrentPage(1);
     }, 400);
     return () => clearTimeout(handler);
   }, [meetingsSearchTerm]);

   // Property Shares debounce
   useEffect(() => {
     const handler = setTimeout(() => {
       setDebouncedPropertySharesSearchTerm(propertySharesSearchTerm);
       setPropertySharesCurrentPage(1);
     }, 400);
     return () => clearTimeout(handler);
   }, [propertySharesSearchTerm]);

   const fetchData = useCallback(
     async (
       page = 1,
       teamMembersSearch = "",
       customersSearch = "",
       propertiesSearch = "",
       meetingsSearch = "",
       propertySharesSearch = "",
       append = false
     ) => {
       try {
         setIsLoading(true);
         const response = await getAgencyById(
           page,
           limit,
           teamMembersSearch,
           customersSearch,
           propertiesSearch,
           meetingsSearch,
           propertySharesSearch,
           agencyId
         );
         if (response.success) {
           setAgency(response.data.agency);
           setTeamMembers((prev) =>
             append
               ? [...prev, ...response.data.teamMembers]
               : response.data.teamMembers
           );
           setCustomers((prev) =>
             append
               ? [...prev, ...response.data.customers]
               : response.data.customers
           );
           setProperties((prev) =>
             append
               ? [...prev, ...response.data.property]
               : response.data.property
           );
           setMeetings((prev) =>
             append
               ? [...prev, ...response.data.meetings]
               : response.data.meetings
           );
           setPropertyShares((prev) =>
             append
               ? [...prev, ...response.data.propertyShare]
               : response.data.propertyShare
           );
           setTeamMembersCurrentPage(
             response.data.teamMembersPagination?.page ?? 1
           );
           setTeamMembersTotalPages(
             response.data.teamMembersPagination?.totalPages ?? 1
           );
           setTeamMembersTotalRecords(
             response.data.teamMembersPagination?.total ?? 0
           );
           setCustomersCurrentPage(
             response.data.customersPagination?.page ?? 1
           );
           setCustomersTotalPages(
             response.data.customersPagination?.totalPages ?? 1
           );
           setCustomersTotalRecords(
             response.data.customersPagination?.total ?? 0
           );
           setPropertiesCurrentPage(
             response.data.propertyPagination?.page ?? 1
           );
           setPropertiesTotalPages(
             response.data.propertyPagination?.totalPages ?? 1
           );
           setPropertiesTotalRecords(
             response.data.propertyPagination?.total ?? 0
           );
           setMeetingsCurrentPage(response.data.meetingsPagination?.page ?? 1);
           setMeetingsTotalPages(
             response.data.meetingsPagination?.totalPages ?? 1
           );
           setMeetingsTotalRecords(
             response.data.meetingsPagination?.total ?? 0
           );
           setPropertySharesCurrentPage(
             response.data.propertySharePagination?.page ?? 1
           );
           setPropertySharesTotalPages(
             response.data.propertySharePagination?.totalPages ?? 1
           );
           setPropertySharesTotalRecords(
             response.data.propertySharePagination?.total ?? 0
           );
         }
       } catch (error) {
         showErrorToast("Failed to fetch data:", error);
       } finally {
         setIsLoading(false);
       }
     },
     [agencyId]
   );

   useEffect(() => {
     if (!agencyId) return;
     setTeamMembers([]);
     setCustomers([]);
     setProperties([]);
     setMeetings([]);
     setPropertyShares([]);
     fetchData(
       1,
       debouncedTeamMembersSearchTerm,
       debouncedCustomersSearchTerm,
       debouncedPropertiesSearchTerm,
       debouncedMeetingsSearchTerm,
       debouncedPropertySharesSearchTerm
     );
   }, [
     agencyId,
     fetchData,
     debouncedTeamMembersSearchTerm,
     debouncedCustomersSearchTerm,
     debouncedPropertiesSearchTerm,
     debouncedMeetingsSearchTerm,
     debouncedPropertySharesSearchTerm,
   ]);

   const formatBudget = (min?: number, max?: number) => {
     return `${formatPrice(min)} - ${formatPrice(max)}`;
   };

   // ==========================================
   // Pagination Handlers
   // ==========================================
   const handleTeamMembersPageChange = (page: number) => {
     if (page >= 1 && page <= teamMembersTotalPages && !isLoading) {
       fetchData(
         page,
         debouncedTeamMembersSearchTerm,
         debouncedCustomersSearchTerm,
         debouncedPropertiesSearchTerm,
         debouncedMeetingsSearchTerm,
         debouncedPropertySharesSearchTerm,
         true
       );
     }
   };

   const handleCustomersPageChange = (page: number) => {
     if (page >= 1 && page <= customersTotalPages && !isLoading) {
       fetchData(
         page,
         debouncedTeamMembersSearchTerm,
         debouncedCustomersSearchTerm,
         debouncedPropertiesSearchTerm,
         debouncedMeetingsSearchTerm,
         debouncedPropertySharesSearchTerm,
         true
       );
     }
   };

   const handlePropertyPageChange = (page: number) => {
     if (page >= 1 && page <= propertiesTotalPages && !isLoading) {
       fetchData(
         page,
         debouncedTeamMembersSearchTerm,
         debouncedCustomersSearchTerm,
         debouncedPropertiesSearchTerm,
         debouncedMeetingsSearchTerm,
         debouncedPropertySharesSearchTerm,
         true
       );
     }
   };

   const handleMeetingsPageChange = (page: number) => {
     if (page >= 1 && page <= meetingsTotalPages && !isLoading) {
       fetchData(
         page,
         debouncedTeamMembersSearchTerm,
         debouncedCustomersSearchTerm,
         debouncedPropertiesSearchTerm,
         debouncedMeetingsSearchTerm,
         debouncedPropertySharesSearchTerm,
         true
       );
     }
   };

   const handlePropertySharesPageChange = (page: number) => {
     if (page >= 1 && page <= propertySharesTotalPages && !isLoading) {
       fetchData(
         page,
         debouncedTeamMembersSearchTerm,
         debouncedCustomersSearchTerm,
         debouncedPropertiesSearchTerm,
         debouncedMeetingsSearchTerm,
         debouncedPropertySharesSearchTerm,
         true
       );
     }
   };

   // ==========================================
   // Skeleton Components
   // ==========================================
   const CardSkeleton = () => (
     <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm animate-pulse">
       <div className="flex items-center space-x-3">
         <div className="h-10 w-10 rounded-full bg-gray-200" />
         <div className="flex-1 space-y-2">
           <div className="h-4 bg-gray-200 rounded w-3/4" />
           <div className="h-3 bg-gray-200 rounded w-1/2" />
         </div>
       </div>
     </div>
   );

   const PropertyCardSkeleton = () => (
     <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 animate-pulse">
       <div className="h-48 w-full bg-gray-200" />
       <div className="p-5 space-y-3">
         <div className="flex justify-between items-start">
           <div className="w-2/3 space-y-2">
             <div className="h-5 bg-gray-200 rounded w-full" />
             <div className="h-3 bg-gray-200 rounded w-1/2" />
           </div>
           <div className="h-5 bg-gray-200 rounded w-1/4" />
         </div>
         <div className="h-4 bg-gray-200 rounded w-full" />
         <div className="flex justify-between pt-2">
           <div className="h-4 bg-gray-200 rounded w-1/4" />
           <div className="h-4 bg-gray-200 rounded w-1/4" />
           <div className="h-4 bg-gray-200 rounded w-1/4" />
         </div>
       </div>
     </div>
   );

   const SimpleRowSkeleton = () => (
     <div className="bg-gray-50 rounded-lg p-4 space-y-3 animate-pulse">
       <div className="h-5 bg-gray-200 rounded w-1/3" />
       <div className="h-4 bg-gray-200 rounded w-3/4" />
       <div className="h-3 bg-gray-200 rounded w-1/6" />
     </div>
   );

   const MeetingCardSkeleton = () => (
     <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse transition-all duration-300">
       <div className="p-5 space-y-4">
         <div className="flex justify-between items-center">
           <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
           <div className="h-6 bg-blue-300 dark:bg-indigo-600 rounded-full w-1/5"></div>
         </div>
         <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
         <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
           <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
           <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/5"></div>
         </div>
         <div className="flex items-center space-x-3 pt-3 border-t border-gray-100 dark:border-gray-700">
           <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
           <div className="space-y-1 w-full">
             <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/5"></div>
             <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
           </div>
         </div>
         <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-4"></div>
       </div>
     </div>
   );

   // ==========================================
   // Meeting Card Component
   // ==========================================
   const MeetingCard: React.FC<{ meeting: MeetingFormData }> = ({
     meeting,
   }) => {
     const primaryImage = meeting.propertyData?.images?.length
       ? getPropertyImageUrlWithFallback(
           meeting.propertyData.images.find((img) => img.isPrimary)?.url
         )
       : getPropertyImageUrlWithFallback();

     const dateFormatted = meeting.date
       ? new Date(meeting.date).toLocaleDateString("en-US", {
           day: "numeric",
           month: "short",
           year: "numeric",
         })
       : "N/A";

     const { colorClass, bgColorClass, statusText } = (() => {
       switch (meeting.status) {
         case "completed":
           return {
             colorClass: "text-green-700",
             bgColorClass: "bg-green-100",
             statusText: "Completed",
           };
         case "cancelled":
           return {
             colorClass: "text-red-700",
             bgColorClass: "bg-red-100",
             statusText: "Cancelled",
           };
         case "rescheduled":
           return {
             colorClass: "text-yellow-700",
             bgColorClass: "bg-yellow-100",
             statusText: "Rescheduled",
           };
         case "scheduled":
         default:
           return {
             colorClass: "text-blue-700",
             bgColorClass: "bg-blue-100",
             statusText: "Scheduled",
           };
       }
     })();

     return (
       <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5">
         <div className="p-5 space-y-4">
           <div className="flex items-start justify-between pb-3 border-b border-dashed border-gray-100 dark:border-gray-700">
             <div>
               <h4 className="flex items-center text-lg font-bold text-gray-900 dark:text-white">
                 <MessageSquare className="w-5 h-5 text-blue-500 dark:text-indigo-400 mr-2 flex-shrink-0" />
                 {meeting.agencyData?.name || "Meeting Subject N/A"}
               </h4>
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                 <Clock className="w-3 h-3 mr-1" />
                 {meeting.time} | {dateFormatted}
               </p>
             </div>
             <span
               className={`px-3 py-1 text-xs font-semibold rounded-full capitalize flex-shrink-0 ml-2 ${bgColorClass} ${colorClass}`}
             >
               {statusText}
             </span>
           </div>

           <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
             <h5 className="font-semibold flex items-center text-gray-900 dark:text-white">
               <User className="w-4 h-4 mr-2 text-red-500 dark:text-red-400" />
               {meeting.customerData?.fullName || "Customer N/A"}
             </h5>
             {meeting.customerData?.email && (
               <a
                 href={`mailto:${meeting.customerData.email}`}
                 className="flex items-center text-xs hover:underline"
               >
                 <Mail className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                 {meeting.customerData.email}
               </a>
             )}

             {meeting.customerData?.phoneNumber && (
               <a
                 href={`tel:${meeting.customerData.phoneNumber}`}
                 className="text-sm text-gray-500 border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-50 hover:text-gray-700 transition-colors"
               >
                 <Phone className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                 {meeting.customerData.phoneNumber}
               </a>
             )}
           </div>

           {meeting.propertyData && (
             <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center space-x-4">
               <div className="flex-shrink-0 h-14 w-14 rounded-lg overflow-hidden border border-gray-200">
                 <Image
                   src={primaryImage}
                   alt={meeting.propertyData.title}
                   width={56}
                   height={56}
                   className="h-full w-full object-cover"
                   onError={handleImageError}
                 />
               </div>
               <div className="flex-grow min-w-0">
                 <h5 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                   {meeting.propertyData.title}
                 </h5>
                 <p className="text-gray-600 dark:text-gray-400 text-xs flex items-center mt-0.5">
                   <MapPin className="w-3 h-3 mr-1 flex-shrink-0 text-red-400" />
                   <span className="truncate">
                     {meeting.propertyData.location}
                   </span>
                 </p>
                 <p className="font-bold text-sm text-blue-600 dark:text-indigo-400 mt-1 flex items-center">
                   <DollarSign className="w-4 h-4 mr-1" />
                   {formatPrice(meeting.propertyData.price)}
                 </p>
               </div>
             </div>
           )}
         </div>
       </div>
     );
   };

   return (
     <div className="max-w-7xl mx-auto p-3 lg:p-6">
       <div className="">
         <div className="">
           {/* Profile Header */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-6">
             <div className="flex items-start space-x-6">
               <div className="flex-1">
                 <div className="flex items-start justify-between">
                   <div>
                     {!agency ? (
                       <div className="animate-pulse space-y-2">
                         <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
                         <div className="h-4 bg-gray-200 rounded w-32" />
                       </div>
                     ) : (
                       <>
                         <h1 className="text-2xl font-bold text-gray-900 mb-1 capitalize">
                           {agency?.name}
                         </h1>
                         <p className="text-lg text-gray-600 mb-3"></p>
                       </>
                     )}

                     <div className="flex items-center space-x-4 text-sm text-gray-600">
                       <span className="flex items-center space-x-1">
                         <User className="w-4 h-4" />
                         <span>{agency?.users?.name || "..."}</span>
                       </span>
                       <span className="flex items-center space-x-1">
                         {agency?.email ? (
                           <a
                             href={`mailto:${agency.email}`}
                             className="flex items-center space-x-1 hover:underline"
                           >
                             <Mail className="w-4 h-4" />
                             <span>{agency.email}</span>
                           </a>
                         ) : (
                           <>
                             <Mail className="w-4 h-4" />
                             <span>...</span>
                           </>
                         )}
                       </span>

                       <span className="flex items-center space-x-1">
                         {agency?.phone ? (
                           <a
                             href={`tel:${agency.phone}`}
                             className="text-sm text-gray-500 border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-50 hover:text-gray-700 transition-colors"
                           >
                             <Phone className="w-4 h-4" />
                             <span>{agency.phone}</span>
                           </a>
                         ) : (
                           <>
                             <Phone className="w-4 h-4" />
                             <span>...</span>
                           </>
                         )}
                       </span>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* Tab Navigation */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-3 md:mt-6 md:mb-6 mb-3">
             <div className="flex overflow-x-auto no-scrollbar">
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
                   className={`flex-1 min-w-[140px] py-4 px-6 text-center font-medium transition-colors whitespace-nowrap ${
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
             {/* TEAM MEMBERS TAB */}
             {activeTab === "team-members" && (
               <div className="space-y-3 md:space-y-6">
                 <div className="flex items-center justify-between">
                   <h3 className="text-lg font-semibold text-gray-900">
                     Team Members
                   </h3>
                   <span className="text-sm text-gray-500">
                     Total Records: {teamMembersTotalRecords}
                   </span>
                 </div>
                 <SearchInput
                   value={teamMembersSearchTerm}
                   onChange={setTeamMembersSearchTerm}
                   placeholder="Search..."
                 />
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   {isLoading && teamMembersCurrentPage === 1 ? (
                     [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
                   ) : teamMembers && teamMembers.length > 0 ? (
                     teamMembers.map((member, index) => (
                       <div
                         key={index}
                         className="group bg-white rounded-xl border border-gray-200 p-2 shadow-sm hover:shadow-md transition-all duration-200"
                       >
                         <div className="flex items-start justify-between">
                           <div className="flex items-center space-x-2">
                             <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-700 shadow-inner">
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
                               <p className="text-sm text-gray-600">
                                 <a
                                   href={`tel:${member.phone}`}
                                   className="text-sm text-gray-500 border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-50 hover:text-gray-700 transition-colors"
                                 >
                                   {member.phone}
                                 </a>
                               </p>
                             </div>
                           </div>
                           <span
                             className={`px-2 py-1 text-xs rounded-full font-medium ${
                               member.status === "active"
                                 ? "bg-green-100 text-green-600"
                                 : "bg-red-100 text-red-600"
                             }`}
                           >
                             {member.status === "active"
                               ? "Active"
                               : "Inactive"}
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
                       <p className="text-gray-500 text-sm">
                         No team members found.
                       </p>
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
             )}

             {activeTab === "customers" && (
               <div className="space-y-3 md:space-y-6">
                 <div className="flex items-center justify-between">
                   <h3 className="text-lg font-semibold text-gray-900">
                     Customers
                   </h3>
                   <span className="text-sm text-gray-500">
                     Total Records: {customersTotalRecords}
                   </span>
                 </div>
                 <div className="flex-1">
                   {/* <label htmlFor="search" className="sr-only">
                    Search
                  </label> */}
                   <SearchInput
                     value={customersSearchTerm}
                     onChange={setCustomersSearchTerm}
                     // aria-hidden="true"
                   />
                 </div>

                 {/* Show Skeleton if Loading AND on Page 1 */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                   {isLoading && customersCurrentPage === 1 ? (
                     [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
                   ) : customers && customers.length > 0 ? (
                     customers.map((customer, index) => (
                       <div
                         key={index}
                         className="group bg-white border border-gray-200 rounded-2xl p-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                       >
                         <div className="flex items-start justify-between">
                           {/* Avatar */}
                           <div className="flex items-center gap-2">
                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-white flex items-center justify-center text-xl font-semibold shadow">
                               {customer.fullName.charAt(0)}
                             </div>

                             <div>
                               <h4 className="font-semibold text-gray-900 text-lg">
                                 {customer.fullName}
                               </h4>
                               <p className="text-gray-500 text-sm">
                                 {customer.email}
                               </p>
                               <p className="text-gray-500 text-sm">
                                 {formatBudget(
                                   customer?.minimumBudget || 0,
                                   customer?.maximumBudget || 0
                                 )}
                               </p>
                             </div>
                           </div>
                           <div>
                             {/* Phone */}
                             <a
                               href={`tel:${customer.phoneNumber}`}
                               className="text-sm text-gray-500 border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-50 hover:text-gray-700 transition-colors"
                             >
                               {customer.phoneNumber}
                             </a>
                           </div>
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="col-span-full text-center mt-10">
                       <img
                         src="/nodata.jpg"
                         alt="No Data"
                         className="mx-auto w-44 h-44 object-contain opacity-80"
                       />
                       <p className="text-gray-500 mt-3 text-lg font-medium">
                         No customers exist.
                       </p>
                     </div>
                   )}
                 </div>

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
                   <h3 className="text-lg font-semibold text-gray-900">
                     Properties
                   </h3>
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
                 {/* Show Skeleton if Loading AND on Page 1 */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {/* Show Skeleton if Loading AND on Page 1 (Initial Load) */}
                   {isLoading && propertiesCurrentPage === 1 ? (
                     [...Array(6)].map((_, i) => (
                       <PropertyCardSkeleton key={i} />
                     ))
                   ) : properties && properties.length > 0 ? (
                     properties.map((property, index) => {
                       const primaryImage =
                         property?.images?.length > 0
                           ? (() => {
                               const primary = property.images.find(
                                 (img) => img.isPrimary
                               );
                               return getPropertyImageUrlWithFallback(
                                 primary?.url
                               );
                             })()
                           : getPropertyImageUrlWithFallback();

                       const statusColor =
                         property.status === "Available"
                           ? "bg-green-500"
                           : property.status === "Booked"
                           ? "bg-yellow-500"
                           : "bg-red-500";

                       const statusText =
                         property.status === "Available"
                           ? "Available"
                           : property.status === "Booked"
                           ? "Booked"
                           : "Sold";

                       return (
                         <div
                           key={property._id || index}
                           className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                         >
                           {/* Property Image with Status Badge */}
                           <div className="h-48 w-full bg-gray-100 relative">
                             <Image
                               height={"300"}
                               width={"300"}
                               src={primaryImage}
                               alt={property.title}
                               className="w-full h-full object-cover"
                               onError={handleImageError}
                             />
                             {/* Status Badge */}
                             <span
                               className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold text-white rounded-full shadow-md ${statusColor}`}
                             >
                               {statusText}
                             </span>
                             {/* Category/Type Tag */}
                             <span className="absolute bottom-3 left-3 px-3 py-1 text-xs font-medium bg-black/60 text-white rounded-full">
                               {property.category} / {property.type}
                             </span>
                           </div>

                           {/* Content */}
                           <div className="p-5 space-y-4">
                             {/* Title & Price Section */}
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 border-gray-100 dark:border-gray-700">
                               <h3 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
                                 {property.title}
                               </h3>
                               <span className="text-2xl font-bold text-blue-600 dark:text-indigo-400 mt-1 sm:mt-0 whitespace-nowrap">
                                 {formatPrice(property.price)}
                               </span>
                             </div>

                             {/* Key Specifications (Icons and Text) */}
                             <div className="grid grid-cols-3 gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                               <div className="flex flex-col items-center space-y-1 p-2 bg-blue-50 dark:bg-gray-700 rounded-lg shadow-sm">
                                 <BedDoubleIcon className="w-4 h-4 text-blue-500 dark:text-indigo-400" />
                                 <span className="truncate text-xs">
                                   {property.bedrooms} Bed
                                 </span>
                               </div>
                               <div className="flex flex-col items-center space-y-1 p-2 bg-blue-50 dark:bg-gray-700 rounded-lg shadow-sm">
                                 <BathIcon className="w-4 h-4 text-blue-500 dark:text-indigo-400" />
                                 <span className="truncate text-xs">
                                   {property.bathrooms} Bath
                                 </span>
                               </div>
                               <div className="flex flex-col items-center space-y-1 p-2 bg-blue-50 dark:bg-gray-700 rounded-lg shadow-sm">
                                 <RulerIcon className="w-4 h-4 text-blue-500 dark:text-indigo-400" />
                                 <span className="truncate text-xs">
                                   {property.built_up_area} sq.ft
                                 </span>
                               </div>
                             </div>

                             {/* Location */}
                             <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                               <MapPin className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                               <span className="truncate">
                                 {property.location || "Location not updated"}
                               </span>
                             </div>

                             {/* Extra details grid (Refined layout) */}
                             <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-dashed border-gray-100 dark:border-gray-700">
                               <p className="truncate">
                                 <span className="font-semibold text-gray-700 dark:text-gray-200">
                                   Facing:
                                 </span>{" "}
                                 {property.facing}
                               </p>
                               <p className="truncate">
                                 <span className="font-semibold text-gray-700 dark:text-gray-200">
                                   Age:
                                 </span>{" "}
                                 {property.property_age}
                               </p>
                               <p className="truncate">
                                 <span className="font-semibold text-gray-700 dark:text-gray-200">
                                   Furnishing:
                                 </span>{" "}
                                 {property.furnishing}
                               </p>
                               <p className="truncate">
                                 <span className="font-semibold text-gray-700 dark:text-gray-200">
                                   RERA:
                                 </span>{" "}
                                 {property.rera_status}
                               </p>
                             </div>

                             {/* Owner Section */}
                             {(property.owner_name ||
                               property.owner_contact) && (
                               <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1">
                                 <p className="font-bold text-sm text-gray-800 dark:text-gray-100">
                                   Owner Contact
                                 </p>
                                 {property.owner_name && (
                                   <p className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                     <User className="w-4 h-4 text-blue-500 mr-2" />
                                     <span className="pl-0 truncate">
                                       {property.owner_name}
                                     </span>
                                   </p>
                                 )}
                                 {property.owner_contact && (
                                   <p className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                     <Phone className="w-4 h-4 text-blue-500 mr-2" />
                                     <span className="pl-0 truncate">
                                       {property.owner_contact}
                                     </span>
                                   </p>
                                 )}
                               </div>
                             )}

                             {/* View Details Button */}
                             <div className="pt-4">
                               <button className="w-full bg-blue-600 dark:bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-indigo-700 transition-colors shadow-lg shadow-blue-200/50 dark:shadow-indigo-900/50">
                                 View Full Details
                               </button>
                             </div>
                           </div>
                         </div>
                       );
                     })
                   ) : (
                     <div className="col-span-full text-center mt-6 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                       <Home className="mx-auto w-16 h-16 text-blue-300 dark:text-indigo-400 mb-4" />
                       <p className="text-gray-500 dark:text-gray-400 mt-2">
                         No properties found matching your criteria.
                       </p>
                     </div>
                   )}
                 </div>

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
               <div className="space-y-6">
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                     Client Meetings
                   </h2>
                   <div className="w-full sm:w-auto">
                     <SearchInput
                       value={meetingsSearchTerm}
                       onChange={setMeetingsSearchTerm}
                       //  ariaLabel="Search meetings..."
                     />
                   </div>
                 </div>

                 {/* Total Records Badge (Moved to a better spot) */}
                 <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                   <CalendarCheck className="inline-block w-4 h-4 mr-1 text-blue-500" />
                   Total Meetings Scheduled:{" "}
                   <span className="font-bold text-gray-800 dark:text-white">
                     {meetingsTotalRecords}
                   </span>
                 </div>

                 <div className="mt-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {/* Show Skeleton if Loading AND on Page 1 */}
                     {isLoading && meetingsCurrentPage === 1 ? (
                       [...Array(6)].map((_, i) => (
                         <MeetingCardSkeleton key={i} />
                       ))
                     ) : meetings && meetings.length > 0 ? (
                       meetings.map((meeting, index) => (
                         <MeetingCard
                           key={meeting._id || index}
                           meeting={meeting}
                         />
                       ))
                     ) : (
                       <div className="col-span-full text-center mt-6 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                         <Calendar className="mx-auto w-16 h-16 text-blue-300 dark:text-indigo-400 mb-4" />
                         <p className="text-gray-500 dark:text-gray-400 mt-2">
                           No meetings found.
                         </p>
                       </div>
                     )}
                   </div>
                   <div className="mt-8">
                     <ScrollPagination
                       currentPage={meetingsCurrentPage}
                       totalPages={meetingsTotalPages}
                       onPageChange={handleMeetingsPageChange}
                       isLoading={isLoading && meetingsCurrentPage > 1}
                       hasMore={meetingsCurrentPage < meetingsTotalPages}
                       loader={
                         <div className="text-center py-4">
                           <Loader2 className="inline-block animate-spin h-8 w-8 text-blue-600 dark:text-indigo-400" />
                         </div>
                       }
                       endMessage={
                         <div className="text-center py-8 text-green-600 dark:text-green-400 font-medium">
                           🎉 All caught up! No more past or future meetings.
                         </div>
                       }
                     />
                   </div>
                 </div>
               </div>
             )}

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
                 <div className="grid grid-cols-1 gap-4">
                   {/* Show Skeleton if Loading AND on Page 1 */}
                   {isLoading && propertySharesCurrentPage === 1 ? (
                     [...Array(6)].map((_, i) => <SimpleRowSkeleton key={i} />)
                   ) : propertyShares && propertyShares.length > 0 ? (
                     propertyShares.map((propertyShare, index) => (
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
                         <p className="text-sm text-gray-500 font-semibold ">
                           Year: {propertyShare.propertyId.createdAt}
                         </p>
                       </div>
                     ))
                   ) : (
                     <div className="col-span-full text-center mt-6">
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
                 </div>
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
               </div>
             )}
           </div>
         </div>
       </div>
     </div>
   );
 }