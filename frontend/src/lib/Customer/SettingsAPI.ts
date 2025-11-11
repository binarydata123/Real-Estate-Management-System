import api from "@/lib/api";
export interface CustomerSettingsResponse {
  success: boolean;
  message: string;
  data: CustomerSettingsType;
}
export const updateCustomerSettings = async (
  data: CustomerSettingsType | undefined,
) => {
  const res = await api.post<CustomerSettingsResponse>(
    `/customer/customer-settings/update-settings`,
    data,
  );
  return res.data.data;
};

export const getCustomerSettings = async () => {
  const response = await api.get<CustomerSettingsResponse>(
    `/customer/customer-settings/get-settings`,
  );
  return response.data.data;
};
