import api from "@/lib/api";
import { CustomerFormDataSchema } from "@/schemas/Agent/customerSchema";

export const inviteAgent = async (customerData: CustomerFormDataSchema) => {
  return await api.post<CustomerResponse>(
    `/agent/inviteAgent/create`,
    customerData
  );
};
