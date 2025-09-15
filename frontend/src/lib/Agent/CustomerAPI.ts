import api from "@/lib/api";
import { CustomerFormData } from "@/schemas/Agent/customerSchema";


export const createCustomer = async (customerData: CustomerFormData) => {
    return await api.post(`/agents/customers`, customerData);
};
