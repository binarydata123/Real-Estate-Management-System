import {  z } from "zod";

const phoneRegex = /^(?:\+91)?[6-9]\d{9}$/;

export const customerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full Name is required."),

    name: z.string().optional(),

    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),

    phoneNumber: z
      .string()
      .min(1, "Phone number is required.")
      .regex(phoneRegex, "Please enter a valid 10-digit phone number."),

    whatsAppNumber: z
      .string()
      .regex(phoneRegex, "Invalid WhatsApp number format")
      .optional()
      .or(z.literal("")),

    minimumBudget: z.number().min(0, "Budget must be positive").optional(),

    maximumBudget: z.number().min(0, "Budget must be positive").optional(),

    leadSource: z
      .enum([
        "website",
        "referral",
        "social_media",
        "advertisement",
        "walk_in",
        "cold_call",
        "other",
      ])
      .optional(),

    initialNotes: z.string().optional(),
    showAllProperty: z.boolean().optional(),
    agencyId: z.string().optional(),
  })
  .refine(
    (data) => {
      // Ensure max budget is greater than or equal to min budget
      if (
        data.minimumBudget !== undefined &&
        data.maximumBudget !== undefined
      ) {
        return data.maximumBudget >= data.minimumBudget;
      }
      return true;
    },
    {
      message: "Maximum budget must be greater than or equal to minimum budget",
      path: ["maximumBudget"],
    },
  );

export type CustomerFormDataSchema = z.infer<typeof customerSchema>;



