import React from "react";

interface Props {
  agencySettings?: AgencySettingsType;
  updateAgencySetting: (
    section: keyof AgencySettingsType,
    field: string,
    value: string | boolean
  ) => void;
}

export const AgencySettings: React.FC<Props> = ({
  agencySettings,
  updateAgencySetting,
}) => {
  return (
    <div className="space-y-3 md:space-y-6">
      <h3 className="text-lg md:text-xl font-semibold text-gray-900">
        Agency Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
        {/* Agency Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Agency Name
          </label>
          <input
            type="text"
            value={agencySettings?.agencySettings?.agencyName || ""}
            onChange={(e) =>
              updateAgencySetting(
                "agencySettings",
                "agencyName",
                e.target.value,
              )
            }
            placeholder="Enter agency name"
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg,
                       focus:ring-2 focus:ring-primary focus:border-primary,
                       text-gray-900 placeholder-gray-400 transition-all duration-150"
          />
        </div>
      </div>
    </div>
  );
};
