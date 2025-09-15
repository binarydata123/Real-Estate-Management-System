import { z } from 'zod';

export const propertySchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    type: z.enum(['residential', 'commercial']),
    category: z.enum(['plot', 'flat', 'showroom', 'office', 'villa', 'land']),
    location: z.string().min(1, 'Location is required'),
    price: z.number().min(1, 'Price must be greater than 0'),
    size: z.number().optional(),
    size_unit: z.string().min(1, 'Unit is required'),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    owner_name: z.string().optional(),
    owner_contact: z.string().optional(),
    owner_notes: z.string().optional(),
});

export type PropertyFormData = z.infer<typeof propertySchema>;
