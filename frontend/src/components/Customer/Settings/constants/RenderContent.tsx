import { NotificationSettings } from "../tabs/NotificationSettings";
import { SecuritySettings } from "../tabs/SecuritySettings";


export const renderTabContent = (
  activeTab: string,
  customerSettings: CustomerSettingsType,
  updateCustomerSetting: (
    section: keyof CustomerSettingsType,
    field: string,
    value: string | boolean
  ) => void
) => {
  switch (activeTab) {
    case "notifications":
      return (
        <NotificationSettings
          customerSettings={customerSettings}
          updateCustomerSetting={updateCustomerSetting}
        />
      );
    case "security":
      return (
        <SecuritySettings
        customerSettings={customerSettings}
          updateCustomerSetting={updateCustomerSetting}
        />
      );
    default:
      return (
        <NotificationSettings
        customerSettings={customerSettings}
          updateCustomerSetting={updateCustomerSetting}
        />
      );
  }
};
