import { AgencyBranding } from "../tabs/AgencyBranding";
import { NotificationSettings } from "../tabs/NotificationSettings";
import { SecuritySettings } from "../tabs/SecuritySettings";

export const renderTabContent = (
  activeTab: string,
  agencySettings: AgencySettingsType,
  updateAgencySetting: (
    section: keyof AgencySettingsType,
    field: string,
    value: string | boolean
  ) => void,
) => {
  switch (activeTab) {
    case "security":
      return (
        <SecuritySettings
          agencySettings={agencySettings}
          updateAgencySetting={updateAgencySetting}
        />
      );
    case "notifications":
      return (
        <NotificationSettings
          agencySettings={agencySettings}
          updateAgencySetting={updateAgencySetting}
        />
      );
    case "branding":
      return (
        <AgencyBranding
          agencySettings={agencySettings}
          updateAgencySetting={updateAgencySetting}
        />
      );
    default:
      return (
         <SecuritySettings
          agencySettings={agencySettings}
          updateAgencySetting={updateAgencySetting}
        />
      );
  }
};
