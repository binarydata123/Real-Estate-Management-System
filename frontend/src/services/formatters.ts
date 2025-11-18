import { showErrorToast } from "@/utils/toastHandler";
import settingsAdminService from "./admin/SettingsAdminService";

export const formatDateToMonthInput = (date: string | undefined | null): string => {
  if (!date) return '';
  try {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return '';
    // Extract YYYY-MM
    return parsed.toISOString().slice(0, 7); // "1982-10"
  } catch {
    return '';
  }
};

export const generateUniqueId = (): string =>
  Date.now().toString() + Math.random().toString(36).substring(2, 9);


export const formatDateToReadable = (isoDate: string): string => {
  if(adminDateFormat) {
    if (!isoDate) return "";
    // parse date in UTC
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "";

    // get localized parts according to timezone
    const options: Intl.DateTimeFormatOptions = {
      timeZone: adminTimezone,
      year: "numeric",
      month: "long",
      day: "2-digit",
    };

    const formatter = new Intl.DateTimeFormat("en-US", options);
    const parts = formatter.formatToParts(date);

    const day = parts.find(p => p.type === "day")?.value ?? "";
    const monthNum = (date.getMonth() + 1).toString().padStart(2, "0"); // numeric
    const monthName = parts.find(p => p.type === "month")?.value ?? "";
    const year = parts.find(p => p.type === "year")?.value ?? "";

    // dynamically replace tokens from adminDateFormat
    return adminDateFormat
      .replace("DD", day)
      .replace("MM", monthNum)
      .replace("Month", monthName)   // full month name
      .replace("YYYY", year);
  }
    // fallback if settings not loaded
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "";

    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'long' }); // "July"
    const year = date.getFullYear();

    return `${day} ${month} ${year}`; // e.g., "18 July 2025
};

let adminDateFormat = ""; // default
let adminTimezone = "";
export const loadAdminSettings = async () => {
  try {
    const settings = await settingsAdminService.getGeneralSettings();
    if (settings?.data?.data?.general) {
      adminDateFormat = settings.data.data.general.dateFormat || adminDateFormat;
      adminTimezone = settings.data.data.general.timezone || adminTimezone;
    }
  } catch (err) {
    showErrorToast("Error loading admin settings:", err);
  }
};
