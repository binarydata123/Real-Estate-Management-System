import { z } from "zod";

export const sharedPropertySchema = z.object({
  fullName: z.string().min(1, "fullName is required"),
  name: z.string().min(1, "Name is required"),
  whatsAppNumber: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phoneNumber: z.string().optional(),
  minimumBudget: z.number().min(0, "Budget must be positive").optional(),
  maximumBudget: z.number().min(0, "Budget must be positive").optional(),
  leadSource: z.enum([
    "website",
    "referral",
    "social_media",
    "advertisement",
    "walk_in",
    "cold_call",
    "other",
  ]),
  initialNotes: z.string().optional(),
  agencyId: z.string().optional(),
  role: z.enum(["agent", "agency_admin"]).optional(),
  phone: z.string().optional(),
});

export type SharedFormDataSchema = z.infer<typeof sharedPropertySchema>;
