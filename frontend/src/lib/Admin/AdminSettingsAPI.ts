import api from "@/lib/api";

export const getAdminSettings = async () => {
  const response = await api.get<AdminSettingsResponse>(
    `/admin/admin-settings`,
  );
  return response.data;
};

export const saveAdminSettings = async (userId: string, data: FormData) => {
    data.append("userId", userId);
    console.log("Final FormData sent →", data);

    const response = await api.post(
        `/admin/admin-settings/saveAdminSettings`,
        data,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response;
};