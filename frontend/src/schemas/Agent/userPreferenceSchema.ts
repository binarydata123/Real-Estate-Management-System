import { z } from 'zod';

// Preprocessing for optional number fields from a form. Handles empty strings and NaN.
const makeOptionalNumber = (schema: z.ZodNumber) =>
    z.preprocess(
        (val) =>
            val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val))
                ? undefined
                : Number(val),
        schema
    ).optional();

const optionalNumber = makeOptionalNumber(z.number({ message: "Invalid number" }).min(0));


export const preferenceSchema = z.object({
    userType: z.enum(['buyer', 'investor']).default('buyer'),
    lookingFor: z.enum(['buy', 'rent']),
    type: z.enum(['residential', 'commercial']).optional(),
    category: z.array(z.string()).optional(),
    minPrice: optionalNumber,
    maxPrice: optionalNumber,
    bedrooms: z.array(z.string()).optional(),
    bathrooms: z.array(z.string()).optional(),
    furnishing: z.array(z.string()).optional(),
    amenities: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    facing: z.array(z.string()).optional(),
    reraStatus: z.array(z.string()).optional(),
    customerId: z.string().optional(),
}).refine(data => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.maxPrice >= data.minPrice;
    }
    return true;
}, { message: 'Max price must be greater than or equal to min price', path: ['maxPrice'] })


export type UserPreferenceFormData = z.infer<typeof preferenceSchema>;
