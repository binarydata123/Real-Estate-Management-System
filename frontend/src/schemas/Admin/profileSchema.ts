import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  profilePictureUrl: z.string().optional()
});

export type ProfileFormDataSchema = z.infer<typeof profileSchema>;

//
export const customerProfileSchema = z.object({
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

  phoneNumber: z
    .string()
    .nonempty("Phone number is required")
    .regex(/^[0-9]+$/, "Phone number must contain only digits")
    .length(10, "Phone number must be exactly 10 digits"),
});

export type CustomerProfile = z.infer<typeof customerProfileSchema>;


