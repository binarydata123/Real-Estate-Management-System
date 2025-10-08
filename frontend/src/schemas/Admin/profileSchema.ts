import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  profilePictureUrl: z.string().optional()
});

export type ProfileFormDataSchema = z.infer<typeof profileSchema>;