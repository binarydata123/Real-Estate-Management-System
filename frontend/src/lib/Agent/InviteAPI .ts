import { AgentMember } from "@/components/Agent/Settings/tabs/InviteAgentModal";
import api from "@/lib/api";
import { CustomerFormDataSchema } from "@/schemas/Agent/customerSchema";

export const inviteAgent = async (customerData: CustomerFormDataSchema) => {
  return await api.post<CustomerResponse>(
    `/agent/inviteAgent/create`,
    customerData,
  );
};

export const  getTeamMember=async ()=>{
 const res=await api.get("/agent/inviteAgent/team-members");
return await res.data;
};

export const  deleteTeamMember=async (id:string)=>{
 const res=await api.delete(`/agent/inviteAgent/${id}`);
return await res.data;
};

export const  updateAgent=async (data:AgentMember)=>{
 const res=await api.put(`/agent/inviteAgent/`,data);
return await res.data;
};
