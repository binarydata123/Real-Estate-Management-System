import api from "@/lib/api";
import { CustomerFormDataSchema } from "@/schemas/Agent/customerSchema";

export const createCustomer = async (customerData: CustomerFormDataSchema) => {
  return await api.post<CustomerResponse>(
    `/agents/customers/create`,
    customerData
  );
};

export const getCustomers = async (userId: string) => {
  const response = await api.get<CustomerResponse>(
    `/agents/customers/get-all?userId=${userId}`
  );
  return response.data;
};

export const updateCustomer = async (
  id: string,
  customerData: Partial<CustomerFormDataSchema>
) => {
  const response = await api.put<CustomerResponse>(
    `/agents/customers/update/${id}`,
    customerData
  );
  return response;
};
