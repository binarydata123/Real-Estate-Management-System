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


export const agentProfileSchema = z.object({
  fullName: z
    .string()
    .nonempty("Full name is required")
    .min(2, "Full name must be at least 2 characters long"),

  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),

  whatsapp: z
    .string()
    .nonempty("WhatsApp number is required")
    .regex(/^[0-9]+$/, "WhatsApp number must contain only digits")
    .length(10, "WhatsApp number must be exactly 10 digits"),

  agencyName: z
    .string()
    .nonempty("Agency name is required"),
});

export type AgentProfileUpdate = z.infer<typeof agentProfileSchema>;
