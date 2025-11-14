import { z } from "zod";

export const agencySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  owner: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().optional(),
  status: z.string().optional(),
  teamMembers: z.string().optional(),
});

export type AgencyFormDataSchema = z.infer<typeof agencySchema>;
