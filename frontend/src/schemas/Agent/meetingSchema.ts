import { z } from "zod";

export const meetingSchema = z.object({
  customer: z
    .string()
    .min(1, "Customer is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Customer must be a valid ObjectId"),
  property: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Property must be a valid ObjectId")
    .optional()
    .nullable(),
  agency: z
    .string()
    .min(1, "Agency is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Agency must be a valid ObjectId")
    .optional()
    .nullable(),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Date must be a valid ISO date string",
    }),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:mm format")
    .optional()
    .nullable(),
  status: z
    .enum(["scheduled", "completed", "cancelled", "rescheduled"])
    .default("scheduled"),
});

export type MeetingFormData = z.infer<typeof meetingSchema>;
