import { z } from "zod";

export const customerSchema = z.object({
  fullName: z.string().min(1, "fullName is required"),
  whatsAppNumber: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
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
});

export type CustomerFormDataSchema = z.infer<typeof customerSchema>;
