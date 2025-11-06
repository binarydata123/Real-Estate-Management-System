import { z } from "zod";

export const agentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    phone: z.string().optional(),
    password: z.string().min(6, "Password is required"),
    role: z.enum(["agent", "customer", 'admin']).optional(),
    status: z.string().optional(),
    profilePictureUrl: z.string().optional(),
    agencyId: z.string().optional(),
});

export type AgentFormDataSchema = z.infer<typeof agentSchema>;