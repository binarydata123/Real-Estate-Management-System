import { z } from 'zod';

export const meetingSchema = z.object({
    customer_name: z.string().min(1, 'Customer name is required'),
    property_title: z.string().optional(),
    scheduled_date: z.string().min(1, 'Date is required'),
    scheduled_time: z.string().min(1, 'Time is required'),
});

export type MeetingFormData = z.infer<typeof meetingSchema>;
