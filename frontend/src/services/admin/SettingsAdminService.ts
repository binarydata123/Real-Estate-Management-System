/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient, { ApiResponse } from "../apiClient";

class SettingsAdminService {
  async sendTestEmails(data: any): Promise<ApiResponse> {
    return apiClient.request(`/admin/admin-setting/send-test-email`, {
      method: "post",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async saveGeneralSettings(settings: any, type: any): Promise<ApiResponse> {
    return apiClient.request(
      `/admin/admin-setting/save-general-setting/${type}`,
      {
        method: "PUT",
        body: JSON.stringify(settings),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  async getGeneralSettings(): Promise<ApiResponse> {
    return apiClient.request("/admin/admin-setting/get-general-setting", {
      method: "GET",
    });
  }

  async getAdminSecuritySettings(): Promise<ApiResponse> {
    return apiClient.request(
      "/admin/admin-setting/get-admin-security-setting",
      {
        method: "GET",
      }
    );
  }

  async getAdminGeneralSettings(): Promise<ApiResponse> {
    return apiClient.request("/admin/admin-setting/get-admin-general-setting", {
      method: "GET",
    });
  }

  async getAdminApiSettings(): Promise<ApiResponse> {
    return apiClient.request("/admin/admin-setting/get-admin-api-setting", {
      method: "GET",
    });
  }
}

const settingsAdminService = new SettingsAdminService();
export default settingsAdminService;
