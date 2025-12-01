interface AgencySettingsType {
  _id: string;
  agencySettings?: {
    agencyName?: string;
    workspaceUrl?: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    agencyLogoUrl: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    meetingReminders: boolean;
    propertyUpdates: boolean;
    customerActivity: boolean;
    systemUpdates: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    // sessionTimeout: "7 days" | "15 days" | "never";
    loginNotifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

//
interface Customer {
  _id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  whatsAppNumber?: string;
}

interface ProfileFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  whatsapp: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
type AxiosErrorResponse = {
  response?: { data: { message: string } };
};

interface AgentProfile {
  _id: string;
  name:string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  whatsAppNumber: string;
  agencyName:string;
  timezone: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AgentProfileFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber?: string;
  agencyName:string;
}

interface ProfileFormValues {
  fullName: string;
  email: string;
  whatsapp: string;
  agencyName: string;
}
interface AgentProfile {
  _id: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  whatsAppNumber: string;
  timezone: string;
  createdAt?: string;
  updatedAt?: string;
}
interface AgentProfileFormData {
  fullName: string;
  email: string;
  whatsapp: string;
  phoneNumber: string;
}

interface PropertyImage {
  _id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface Property {
  _id: string;
  title: string;
  type?: string;
  category?: string;
  location?: string;
  price?: number;
  size?: number;
  size_unit?: string;
  bedrooms?: number;
  bathrooms?: number;
  status: string;
  images: PropertyImage[];
  createdAt: string;
  description?: string;
  owner_contact?: string | number;
  rera_status?: string;
  flooring_type?: string;
  created_at: string;
}
