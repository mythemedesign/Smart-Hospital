import { z } from 'zod';

// Valid appointment statuses
const validStatuses = [
    'scheduled',
    'completed',
    'cancelled',
    'no-show',
    'rescheduled'
] as const;

// Base appointment schema
export const AppointmentSchema = z.object({
    doctorId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid doctor ID format')
        .min(24, 'Doctor ID must be 24 characters')
        .max(24, 'Doctor ID must be 24 characters'),
    
    patientId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid patient ID format')
        .min(24, 'Patient ID must be 24 characters')
        .max(24, 'Patient ID must be 24 characters'),
    
    time: z.string()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format (24-hour)')
        .refine(
            (time) => {
                const [hours, minutes] = time.split(':').map(Number);
                return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
            },
            'Invalid time value'
        ),
    
    date: z.coerce.date()
        .refine(
            (date) => date >= new Date(new Date().setHours(0, 0, 0, 0)),
            'Appointment date cannot be in the past'
        ),
    
    status: z.enum(validStatuses, {
        errorMap: () => ({ message: 'Please select a valid appointment status' })
    }).default('scheduled'),
    
    notes: z.string()
        .max(500, 'Notes cannot exceed 500 characters')
        .optional()
        .nullable()
});

// Schema for updating an appointment (all fields optional)
export const AppointmentUpdateSchema = AppointmentSchema.partial();

// Type inference
export type AppointmentInput = z.infer<typeof AppointmentSchema>;
export type AppointmentUpdateInput = z.infer<typeof AppointmentUpdateSchema>; 