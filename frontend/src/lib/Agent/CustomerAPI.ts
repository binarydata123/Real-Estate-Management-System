import api from "@/lib/api";
import { CustomerFormDataSchema } from "@/schemas/Agent/customerSchema";

export const createCustomer = async (customerData: CustomerFormDataSchema) => {
  return await api.post<CustomerResponse>(
    `/agent/customers/create`,
    customerData,
  );
};

export const getCustomers = async (
  userId: string,
  page?: number,
  limit?: number,
  search = "",
) => {
  const params: Record<string, string> = {};
  if (page !== undefined) {
    params.page = page.toString();
  }
  if (limit !== undefined) {
    params.limit = limit.toString();
  }
  if (search) {
    params.search = search;
  }
  const query = new URLSearchParams(params);
  const response = await api.get<CustomerResponse>(
    `/agent/customers/get-all?userId=${userId}&${query.toString()}`,
  );
  return response.data;
};

export const updateCustomer = async (
  id: string,
  customerData: Partial<CustomerFormDataSchema>,
) => {
  const response = await api.put<CustomerResponse>(
    `/agent/customers/update/${id}`,
    customerData,
  );
  return response;
};
export const deleteCustomerById = async (id: string) => {
  return await api.delete(`/agent/customers/delete/${id}`);
};

export const getCustomersForDropDown = async (userId: string) => {
  const response = await api.get<CustomerResponse>(
    `/agent/customers/get-all-for-dropDown?userId=${userId}`,
  );
  return response.data;
};
