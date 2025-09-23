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
  }

  interface Property {
    size_unit: string;
    size: ReactNode;
    _id?: string;
    id?: string;
    title: string;
    description?: string;
    type: 'residential' | 'commercial';
    category: 'plot' | 'flat' | 'showroom' | 'office' | 'villa' | 'land' | 'farmHouse';
    location?: string;
    price: number;

    // Area & Configuration
    built_up_area?: number;
    carpet_area?: number;
    unit_area_type?: "sqft" | "sqm" | "acre" | "marla" | "kanal" | "bigha" | "sqyd" | "hectare" | "gaj";

    // Plot specific
    plot_front_area?: number;
    plot_depth_area?: number;
    plot_dimension_unit?: "ft" | "m";
    is_corner_plot?: boolean;

    // Residential specific
    bedrooms?: number;
    bathrooms?: number;
    balconies?: number;

    // Commercial specific
    washrooms?: number;
    cabins?: number;
    conference_rooms?: number;

    // Common
    floor_number?: number;
    total_floors?: number;

    // Facing / Overlooking
    facing?: "North" | "South" | "East" | "West" | "North-East" | "North-West" | "South-East" | "South-West" | "";
    overlooking?: string[];

    // Age / Transaction Details
    property_age?: "New" | "1-5 years" | "5-10 years" | "10+ years" | "";
    transaction_type?: 'New' | 'Resale';
    gated_community?: boolean;

    // Utilities
    water_source?: string[];
    power_backup?: 'None' | 'Partial' | 'Full';

    // Features & Amenities
    furnishing?: 'Unfurnished' | 'Semi-Furnished' | 'Furnished';
    features?: string[];
    amenities?: string[];

    // Media
    images: ImageData[];

    // Status & Timestamps
    status: "Available" | "Pending" | "Sold" | "Rented";
    createdAt?: string | Date;
    updatedAt?: string | Date;
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
    whatsAppNumber?: string;
    phoneNumber?: string;
    minimumBudget?: number;
    maximumBudget?: number;
    leadSource:
    | "website"
    | "referral"
    | "social_media"
    | "advertisement"
    | "walk_in"
    | "cold_call"
    | "other";
    initialNotes?: string;
    agencyId?: string;
    status: string;
    assigned_agent: string;
    minimumBudget: number;
  }

  interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  interface Meeting {
    _id: string;
    isPast?: boolean;
    customer?: Partial<CustomerFormData>;
    property?: string | Partial<Property>;
    agency?: Partial<Agency>;
    date?: string;
    time?: string;
    status?: "scheduled" | "completed" | "cancelled" | "rescheduled";
    notes?: string;
    created_at?: string;
    updated_at?: string;
  }

  interface SharePropertyFormData {
    propertyId: Property;
    sharedWithUserId: CustomerFormData;
    message?: string;
    sharedByUserId: UserRef;
    agencyId: string;
    _id: string;
    status: string;
    createdAt: string;
  }

  interface sharePropertyResponse {
    success: boolean;
    data: SharePropertyFormData[];
    message?: string;
    pagination?: Pagination;
  }
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
};
