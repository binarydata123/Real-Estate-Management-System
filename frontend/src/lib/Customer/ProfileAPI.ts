import api from "@/lib/api";

export const getCustomerProifile = async (): Promise<ApiResponse<Customer>> => {
  const res = await api.get<ApiResponse<Customer>>("/customer/profile/get-profile");
  return res.data;
};


export const updateCustomerProfile = async (
  data: ProfileFormData
): Promise<ApiResponse<Customer>> => {
  const res = await api.post<ApiResponse<Customer>>("/customer/profile/update", data);
  return res.data;
};
