import api from "@/lib/api";


export const approveQr = async (code: string) => {
  try {
    const response = await api.post("/qr/approve", { code });
    return response.data;
  } catch (error) {
    throw error;
  }
};
