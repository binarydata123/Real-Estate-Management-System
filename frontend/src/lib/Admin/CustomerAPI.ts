import api from "@/lib/api";
import { CustomerFormDataSchema } from "@/schemas/Admin/customerSchema";

export const getCustomers = async (
  page?: number,
  limit?: string,
  search = "",
  status = "",
  agencyId = "",
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
  if ( status) {
    params.status = status;
  }
  if (agencyId) {
    params.agencyId = agencyId;
  }
  const query = new URLSearchParams(params);
  const response = await api.get<CustomerResponse>(
    `/admin/customers/get-all-customers?${query.toString()}`,
  );
  return response.data;
};

export const updateCustomer = async (
  id: string,
  customerData: Partial<CustomerFormDataSchema>,
) => {
  const response = await api.put<CustomerResponse>(
    `/admin/customers/update/${id}`,
    customerData,
  );
  return response;
};
export const deleteCustomerById = async (id: string) => {
  return await api.delete(`/admin/customers/delete/${id}`);
};
