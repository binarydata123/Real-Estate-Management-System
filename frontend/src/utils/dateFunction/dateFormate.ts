import settingsAdminService from "../../services/admin/SettingsAdminService";
import { showErrorToast } from "../toastHandler";
export function formatDate(input: string | number | Date): string {
  try {
    if (adminDateFormat) {
      const date = new Date(input);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date input");
      }

      // Break date down using Intl with timezone
      const options: Intl.DateTimeFormatOptions = {
        timeZone: adminTimezone,
        day: "2-digit",
        month: "long",
        year: "numeric",
      };

      const formatter = new Intl.DateTimeFormat("en-US", options);
      const parts = formatter.formatToParts(date);

      const day = parts.find((p) => p.type === "day")?.value ?? "";
      const monthFull = parts.find((p) => p.type === "month")?.value ?? "";
      const monthShort = date.toLocaleString("en-US", {
        month: "short",
        timeZone: adminTimezone,
      });
      const monthNum = date.toLocaleString("en-US", {
        month: "2-digit",
        timeZone: adminTimezone,
      });
      const year = parts.find((p) => p.type === "year")?.value ?? "";

      // Replace tokens dynamically
      return adminDateFormat
        .replace("DD", day)
        .replace("MM", monthNum)
        .replace("Mon", monthShort) // e.g. Jul
        .replace("Month", monthFull) // e.g. July
        .replace("YYYY", year);
    }
      // Fallback if settings not loaded
      const date = new Date(input);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date input");
      }
      const day = date.getDate().toString().padStart(2, "0");
      const month = date.toLocaleString("en-US", { month: "short" });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`; // e.g., "18 July 2025"

  } catch (error) {
    showErrorToast("Error formatting date:", error);
    return "";
  }
}
export const convertTo12Hour = (input: string | number | Date): string => {
  try {
    const date = new Date(input);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date input");
    }

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${ampm}`;
  } catch (error) {
    showErrorToast("Error converting to 12-hour format:", error);
    return "";
  }
};

let adminDateFormat = ""; // default
let adminTimezone = "";

export const loadAdminSettingData = async () => {
  try {
    const settings = await settingsAdminService.getGeneralSettings();
    if (settings?.data?.data?.general) {
      adminDateFormat =
        settings.data.data.general.dateFormat || adminDateFormat;
      adminTimezone = settings.data.data.general.timezone || adminTimezone;
    }
  } catch (err) {
    showErrorToast("Error loading admin settings:", err);
  }
};
