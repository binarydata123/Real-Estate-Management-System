import React from "react";

interface Props {
  agencySettings?: AgencySettingsType;
  updateAgencySetting: (
    section: keyof AgencySettingsType,
    field: string,
    value: string | boolean
  ) => void;
}

export const AgencyBranding: React.FC<Props> = ({
  agencySettings,
  updateAgencySetting,
}) => {
  const branding = agencySettings?.branding;

  return (
    <div className="space-y-3 md:space-y-6">
      <h3 className="text-lg md:text-xl font-semibold text-gray-900">
        Agency Branding
      </h3>

      {/* Color Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
        {/* Primary Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={branding?.primaryColor || "#2563eb"}
              onChange={(e) =>
                updateAgencySetting("branding", "primaryColor", e.target.value)
              }
              className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={branding?.primaryColor || "#2563eb"}
              onChange={(e) =>
                updateAgencySetting("branding", "primaryColor", e.target.value)
              }
              className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-primary focus:border-primary
                         text-gray-900 placeholder-gray-400 transition-all duration-150"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
