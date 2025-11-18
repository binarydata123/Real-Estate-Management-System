import api from "@/lib/api";

export const getAdminProfile = async () => {
  const response = await api.get<ProfileResponse>(
    `/admin/profile/get-admin-profile`,
  );
  return response.data;
};

export const updateAdminProfile = async (
  id: string,
  data: FormData,
) => {
  const response = await api.put<ProfileResponse>(
    `/admin/profile/update/${id}`,
    data,
  );
  return response;
};
