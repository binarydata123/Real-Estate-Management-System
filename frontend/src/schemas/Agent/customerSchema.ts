import { z } from 'zod';

export const customerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    whatsapp: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    budget_min: z.number().min(0, 'Budget must be positive').optional(),
    budget_max: z.number().min(0, 'Budget must be positive').optional(),
    source: z.enum(['website', 'referral', 'social_media', 'advertisement', 'walk_in', 'cold_call', 'other']),
    notes: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
