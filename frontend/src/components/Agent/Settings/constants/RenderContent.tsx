import { AgencyBranding } from "../tabs/AgencyBranding";
import { AgencySettings } from "../tabs/AgencySettings";
import { NotificationSettings } from "../tabs/NotificationSettings";
import { SecuritySettings } from "../tabs/SecuritySettings";

export const renderTabContent = (
  activeTab: string,
  agencySettings: AgencySettingsType,
  updateAgencySetting: (
    section: keyof AgencySettingsType,
    field: string,
    value: string | boolean
  ) => void
) => {
  switch (activeTab) {
    case "agency":
      return (
        <AgencySettings
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
    case "security":
      return (
        <SecuritySettings
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
        <AgencySettings
          agencySettings={agencySettings}
          updateAgencySetting={updateAgencySetting}
        />
      );
  }
};
