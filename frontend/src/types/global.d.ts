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

  interface Property {
    id: string;
    title: string;
    type: string;
    description: string;
    category: string;
    location: string;
    price: number;
    size?: number;
    size_unit: string;
    bedrooms?: number;
    bathrooms?: number;
    status: string;
    images: string[];
    created_at: string;
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
    customer?: string;
    property?: string | Partial<Property>;
    agency?: Partial<Agency>;
    date?: string;
    time?: string;
    status?: "scheduled" | "completed" | "cancelled" | "rescheduled";
    notes?: string;
    created_at?: string;
    updated_at?: string;
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
};
