import api from "@/lib/api";
import { sharePropertySchema } from "@/schemas/Agent/sharePropertySchema";

export const shareProperty = async (data: sharePropertySchema) => {
  return await api.post<sharePropertyResponse>(
    `/agent/shareProperties/postShareProperty`,
    data,
  );
};

export const getSharedProperties = async (
  agencyId: string,
  page: number,
  limit: number
) => {
  const response = await api.get<sharePropertyResponse>(
    `/agent/shareProperties/getAllSharedProperties`,
    {
      params: { agencyId, page, limit },
    }
  );

  return response.data;
};