interface CustomerSettingsType {
  _id: string;
  customerSettings?: {
    customerName?: string;
    workspaceUrl?: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    customerLogoUrl: string;
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
    sessionTimeout: "7 days" | "15 days" | "never";
    loginNotifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
  __v?: number;
}



interface Property {
  _id: string;
  title: string;
}
