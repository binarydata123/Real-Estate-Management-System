// types/global.d.ts
declare global {
  // PWA related types
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
      outcome: "accepted" | "dismissed";
      platform: string;
    }>;
    prompt(): Promise<void>;
  }
  interface UserRef {
    _id: string;
    name: string;
    email?: string;
  }
  // Auth related types
  interface RegistrationData {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    agencyName: string;
    agencySlug: string;
    userId?: string; // Optional field for backend compatibility
  }

  interface changePasswordData {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
    email?: string;
    phone?: string | number;
  }

  interface LoginData {
    email: string;
    password: string;
  }

  type AgencyStatus = "approved" | "pending" | "rejected";

  interface Agency {
    id: string;
    name: string;
    logo_url?: string;
    members: number;
    properties: number;
    status: AgencyStatus;
    joined: string;
  }

  interface ImageData {
    url: string;
    alt?: string;
    isPrimary?: boolean;
    _id?: string;
  }

  interface Property {
    owner_contact: string | number;
    rera_status: string;
    flooring_type: string;
    size_unit: string;
    size: ReactNode;
    _id?: string;
    id?: string;
    title: string;
    description?: string;
    type: "residential" | "commercial";
    category:
    | "plot"
    | "flat"
    | "showroom"
    | "office"
    | "villa"
    | "land"
    | "farmHouse";
    location?: string;
    price: number;

    // Area & Configuration
    built_up_area?: number;
    carpet_area?: number;
    unit_area_type?:
    | "sqft"
    | "sqm"
    | "acre"
    | "marla"
    | "kanal"
    | "bigha"
    | "sqyd"
    | "hectare"
    | "gaj";

    // Plot specific
    plot_front_area?: number;
    plot_depth_area?: number;
    plot_dimension_unit?: "ft" | "m";
    is_corner_plot?: boolean;

    // Residential specific
    bedrooms: number;
    bathrooms: number;
    balconies: number;

    // Commercial specific
    washrooms?: number;
    cabins?: number;
    conference_rooms?: number;

    // Common
    floor_number?: number;
    total_floors?: number;

    // Facing / Overlooking
    facing?:
    | "North"
    | "South"
    | "East"
    | "West"
    | "North-East"
    | "North-West"
    | "South-East"
    | "South-West"
    | "";
    overlooking?: string[];

    // Age / Transaction Details
    property_age?: "New" | "1-5 years" | "5-10 years" | "10+ years" | "";
    transaction_type?: "New" | "Resale";
    gated_community?: boolean;

    // Utilities
    water_source?: string[];
    power_backup?: "None" | "Partial" | "Full";

    // Features & Amenities
    furnishing?: "Unfurnished" | "Semi-Furnished" | "Furnished";
    features?: string[];
    amenities?: string[];

    // Media
    images: ImageData[];

    // Status & Timestamps
    status: "Available" | "Pending" | "Sold" | "Rented";
    createdAt?: string | Date;
    updatedAt?: string | Date;
    agencyId?: {
      email: string;
      id: string;
      members: number;
      name: string;
      phone: string;
      status: string;
      _id: string;
    };
    owner_name?: string;
  }

  interface CustomerResponse {
    success: boolean;
    data: CustomerFormData[];
    message?: string;
    pagination?: Pagination;
  }

  interface CustomerFormData {
    _id: string;
    email: string | "";
    fullName: string;
    name?: string;
    whatsAppNumber?: string;
    phoneNumber?: string;
    phone?: string;
    minimumBudget?: number;
    maximumBudget?: number;
    leadSource?:
      "manual"
    | "website"
    | "referral"
    | "social_media"
    | "advertisement"
    | "walk_in"
    | "cold_call"
    | "other";
    initialNotes?: string;
    status?: string;
    assigned_agent?: string;
    minimumBudget?: number;
    agencyId?: {
      email: string;
      id: string;
      members: number;
      name: string;
      phone: string;
      status: string;
      _id: string;
    };
    role?: string;
    showAllProperty?: boolean;
    createdAt?: string;
  }

  interface MeetingResponse {
    success: boolean;
    data: MeetingFormData[];
    message?: string;
    pagination?: Pagination;
  }

  interface MeetingFormData {
    _id: string;
    customerId: string;
    propertyId: string;
    agencyId?: string;
    date?: string;
    time?: string;
    status: string;
    createdAt: string;
    customerData: CustomerFormData;
    propertyData: Property;
    agencyData: AgencyFormData;
  }

  interface SharedPropertyResponse {
    success: boolean;
    data: SharedPropertiesFormData[];
    message?: string;
    pagination?: Pagination;
  }

  interface SharedPropertiesFormData {
    _id: string;
    agencyId?: AgencyFormData;
    propertyId: Property;
    sharedsharedWithUserId: CustomerFormData;
    sharedByUserId: UserData;
    message?: string;
    createdAt: string;
  }

  interface Pagination {
    allCustomers: number;
    total: number;
    page: number;
    limit: number;
    totalUnfiltered?: number;
    totalPages: number;
    scheduledCount?: number;
    totalWithoutFilter?: number;
    totalAgencies?: number,
    totalMeetings?: number,
  }
  interface Meeting {
    _id: string;
    isPast?: boolean;
    customer?: Partial<CustomerFormData>;
    property?: string | Partial<Property>;
    propertyId?: { _id: string; title: string };
    agency?: Partial<Agency>;
    date?: string;
    time?: string;
    status?: "scheduled" | "completed" | "cancelled" | "rescheduled";
    notes?: string;
    created_at?: string;
    updated_at?: string;
    agencyId?: AgencyRef;
  }
  interface AgencyRef {
    _id: string;
    name: string;
  }

  interface SharedWithSchema {
    fullName: string;
    _id: string;
  }

  interface SharedBySchema {
    createdAt: string;
    email: string;
    name: string;
    phone: string;
    _id: string;
  }

  interface SharePropertyFormData {
    propertyId: Property;
    sharedWithUserId: SharedWithSchema;
    message?: string;
    sharedByUserId: SharedBySchema;
    agencyId: string;
    _id: string;
    status: string;
    createdAt: string;
    agencyData: AgencyFormData;
    propertyData: Property;
    customerData: CustomerFormData;
    userData: UserData;
  }

  interface sharePropertyResponse {
    success: boolean;
    data: SharePropertyFormData[];
    message?: string;
    pagination?: Pagination;
    stats?: {
      totalCountForStats: number,
      totalProperties?: number,
    }
  }

  interface PropertyResponse {
    success: boolean;
    data: Property[];
    pagination?: {
      page: number;
      pages: number;
      totalPages: number;
      totalProperties: number;
      totalUnfiltered:number;
      totalAgencies?: number,
      total:number;
    };
  }

  interface AgencyResponse {
    success: boolean;
    data: AgencyFormData[];
    message?: string;
    pagination?: Pagination;
    stats?: {
      totalAgencies: number;
      totalProperties?: number;
    }
  }

  interface AgencyFormData {
    _id: string;
    name: string;
    slug: string;
    owner: string;
    email: string | "";
    phone?: string;
    status: string;
    teamMembers?: [];
    createdAt: Date;
    updatedAt: Date;
    properties?: [];
    users?: UserData;
    customers?: CustomerFormData[];
    meetings?: [];
    propertyshares?: [];
    whatsAppNumber?: string;
  }

  interface PropertyResponse {
    success: boolean;
    data: Property[];
    message?: string;
    pagination?: Pagination;
  }

  interface AgentResponse {
    success: boolean;
    data: AgentFormData[];
    message?: string;
    pagination?: Pagination;
  }

  interface AgentFormData {
    _id: string;
    name: string;
    email: string | "";
    phone?: string;
    password?: string;
    role?: string;
    status: string;
    profilePictureUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    agencyId?: {
      email: string;
      id: string;
      members: number;
      name: string;
      phone: string;
      status: string;
      _id: string;
    };
    customersCount?: number;
    propertiesCount?: number;
  }

  interface TeamMemberResponse {
    success: boolean;
    data: TeamMemberFormData[];
    message?: string;
    pagination?: Pagination;
  }

  interface TeamMemberFormData {
    _id: string;
    name: string;
    email: string | "";
    phone?: string;
    password?: string;
    role?: string;
    status: string;
    profilePictureUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    agencyId?: {
      email: string;
      id: string;
      members: number;
      name: string;
      phone: string;
      status: string;
      _id: string;
    };
    customersCount?: number;
    propertiesCount?: number;
  }

  interface DashboardResponse {
    success: boolean;
    data: {
      stats: Stats[];
      userGrowthData: UserGrowthData[];
      propertyGrowthData: PropertyGrowthData[];
      recentUsers: RecentUserData[];
      recentAgencies: AgencyData[];
    };
    message?: string;
  }

  interface Stats {
    name: string;
    stat: number;
  }

  interface UserGrowthData {
    name: string;
    users: number;
  }

  interface PropertyGrowthData {
    name: string;
    properties: number;
  }

  interface RecentUserData {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: string;
  }

  interface AgencyData {
    _id: string;
    name: string;
    email: string;
    phone: string;
  }

  interface ProfileResponse {
    success: boolean;
    data: UserData;
    message: string;
  }

  interface UserData {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    password?: string;
    profilePictureUrl?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    agencyId?: string;
  }

  interface AnalyticsResponse {
    success: boolean;
    data: {
      stats: AnalyticsStats;
      monthlyUsers: AnalyticsMonthlyUsers[];
      monthlyCustomers: AnalyticsMonthlyUsers[];
      monthlyRevenue: AnalyticsMonthlyRevenue[];
      recentActivities: AnalyticsRecentActivities[];
      topAgents: AnalyticsTopAgents[];
    };
    message?: string;
  }
  interface AnalyticsStats {
    totalUsers: number;
    totalAgencies: number;
    totalCustomers: number;
    totalProperties: number;
    totalMeetings: number;
    totalRevenue: number;
    totalSharedProperties: number;
  }

  interface AnalyticsMonthlyRevenue {
    _id: number;
    total: number;
  }
  interface FormattedMonthlyRevenue {
    name: string;
    revenue: number;
  }
  interface AnalyticsMonthlyUsers {
    _id: number;
    count: number;
  }
  interface FormattedMonthlyUsers {
    name: string;
    signUps: number;
  }
  interface FormattedMonthlyCustomers {
    name: string;
    customers: number;
  }
  interface AnalyticsRecentActivities {
    id: string;
    user: string;
    action: string;
    time: string;
    icon: string;
  }
  interface AnalyticsTopAgents {
    id: string;
    deals: number;
    name: string;
    profilePictureUrl: string;
  }
  interface PreferencesResponse {
    success: boolean;
    data: PreferencesFormData[];
    message?: string;
    pagination?: Pagination;
  }

  interface PreferencesFormData {
    _id?: string;
    userId?: string;
    userType: "buyer" | "investor";
    lookingFor: "buy" | "rent";
    type: "residential" | "commercial";
    category: string[];
    minPrice: number;
    maxPrice: number;
    bedrooms: string[];
    bathrooms: string[];
    furnishing: string[];
    amenities: string[];
    features: string[];
    facing: string[];
    reraStatus: string[];
  }
  interface AdminSettingsResponse {
    success: boolean;
    data: AdminSettingData;
    userData: UserData;
    message: string;
  }
  interface AdminSettingData {
    _id?: string;
    logoUrl?: string;
    logoFile?: string;
    faviconUrl?: string;
    faviconFile?: string;
    footerContent?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    notificationEmailAlert?: boolean;
    notificationLoginAlert?: boolean;
    notificationUpdatesAlert?: boolean;
    notificationSecurityAlert?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  interface PropertyFeedback {
    _id?: string;
    userId?: UserData;
    propertyId?: Property;
    liked?: boolean;
    reason?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
  }
}
interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: "agent" | "agency_admin";
  status: string;
  joinedAt: string;
  createdAt: string;
  phone?: string;
}
interface brandColor {
  primaryColor: string | null;
}
export {
  RegistrationData,
  LoginData,
  AgencyStatus,
  Agency,
  Property,
  Meeting,
  CustomerFormData,
  CustomerResponse,
  BeforeInstallPromptEvent,
  Pagination,
  SharePropertyFormData,
  AgencyResponse,
  AgencyFormData,
  TeamMember,
  brandColor,
};
