import { z } from "zod";

export const sharePropertySchema = z.object({
  sharedWithUserId: z.string().nonempty("Select a customer to share with"),
  message: z.string().optional(),
  propertyId: z.string().nonempty("Property ID is required"),
  sharedByUserId: z.string().nonempty("Agent ID is required"),
  agencyId: z.string().nonempty("Agency ID is required"),
});

export type sharePropertySchema = z.infer<typeof sharePropertySchema>;
