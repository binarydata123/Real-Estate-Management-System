// types/global.d.ts
declare global {
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
    message: string;
  }

  interface CustomerFormData {
    _id: string;
    fullName: string;
    whatsAppNumber?: string;
    email?: string;
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
}

export {
  RegistrationData,
  LoginData,
  AgencyStatus,
  Agency,
  Property,
  CustomerResponse,
  CustomerFormData,
};
