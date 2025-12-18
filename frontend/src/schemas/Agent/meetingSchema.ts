import { z } from "zod";

// ✅ BASE SCHEMA - Only date and time (for customers)
const baseMeetingSchema = z.object({
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Date must be a valid ISO date string",
    })
    .refine(
      (val) => {
        const selected = new Date(val);
        const today = new Date();

        // Remove time — compare only YYYY-MM-DD
        selected.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return selected >= today;
      },
      {
        message: "Date cannot be in the past",
      }
    ),
  time: z
    .string()
    .min(1, "Time is required")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:mm format"),
});

// ✅ AGENT SCHEMA - Full schema with all required fields
export const meetingSchema = baseMeetingSchema.extend({
  customerId: z
    .string()
    .min(1, "Customer is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Customer must be a valid ObjectId"),

  propertyId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Property must be a valid ObjectId")
    .optional()
    .or(z.literal("")) // ✅ allows empty string
    .nullable(),

  agencyId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Agency must be a valid ObjectId")
    .optional()
    .or(z.literal("")) // ✅ allows empty string
    .nullable(),

  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Date must be a valid ISO date string",
    })
    .refine(
      (val) => {
        const selected = new Date(val);
        const today = new Date();

        // Remove time — compare only YYYY-MM-DD
        selected.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return selected >= today;
      },
      {
        message: "Date cannot be in the past",
      }
    ),
  time: z
    .string()
    .min(1, "Time is required")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:mm format"),

  status: z
    .enum(["scheduled", "completed", "cancelled", "rescheduled", "confirmed"])
    .default("scheduled")
    .optional(),
});

// CUSTOMER SCHEMA - Only date and time (no validation for IDs)
export const customerMeetingSchema = baseMeetingSchema;

//  Type definitions
export type MeetingFormData = z.infer<typeof meetingSchema>;
export type CustomerMeetingFormData = z.infer<typeof customerMeetingSchema>;