import api from "@/lib/api";
import { CustomerFormData } from "@/schemas/Agent/customerSchema";


export const createCustomer = async (agencyId: string, customerData: CustomerFormData) => {
    return await api.post(`/agents/${agencyId}/customers`, customerData);
};
