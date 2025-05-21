import { z } from 'zod';

// Common validation patterns
const phoneRegex = /^\+?[1-9]\d{1,14}$/; // International phone number format
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// List of valid medical specialties
const validSpecialties = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Obstetrics and Gynecology',
    'Ophthalmology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Urology',
    'General Medicine',
    'Emergency Medicine',
    'Family Medicine',
    'Internal Medicine',
    'Surgery'
] as const;

// Define valid days of the week
const validDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
] as const;

// Time format validation
const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Available slot schema
const AvailableSlotSchema = z.object({
    day: z.enum(validDays, {
        errorMap: () => ({ message: 'Please provide a valid day of the week' })
    }),
    startTime: z.string()
        .regex(timeRegex, 'Start time must be in HH:MM format (24-hour)')
        .refine(
            (time) => {
                const [hours, minutes] = time.split(':').map(Number);
                return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
            },
            'Invalid start time value'
        ),
    endTime: z.string()
        .regex(timeRegex, 'End time must be in HH:MM format (24-hour)')
        .refine(
            (time) => {
                const [hours, minutes] = time.split(':').map(Number);
                return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
            },
            'Invalid end time value'
        )
}).refine(
    (slot) => {
        const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
        const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        return endTotalMinutes > startTotalMinutes;
    },
    {
        message: 'End time must be after start time',
        path: ['endTime'] // This will show the error on the endTime field
    }
);

// Base doctor schema
export const DoctorSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters long')
        .max(100, 'Name cannot exceed 100 characters')
        .regex(/^[a-zA-Z\s-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
    
    specialty: z.enum(validSpecialties, {
        errorMap: () => ({ message: 'Please select a valid medical specialty' })
    }),
    
    email: z.string()
        .email('Invalid email format')
        .transform(val => val.toLowerCase()),
    
    phone: z.string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
    
    avatarUrl: z.string()
        .url('Invalid URL format')
        .optional()
        .nullable(),
    
    availableSlots: z.array(AvailableSlotSchema)
        .default([])
        .refine(
            (slots) => {
                // Check for duplicate days
                const days = slots.map(slot => slot.day);
                return new Set(days).size === days.length;
            },
            {
                message: 'Duplicate days are not allowed in available slots',
                path: ['availableSlots']
            }
        )
});

// Schema for updating a doctor (all fields optional)
export const DoctorUpdateSchema = DoctorSchema.partial();

// Type inference
export type DoctorInput = z.infer<typeof DoctorSchema>;
export type DoctorUpdateInput = z.infer<typeof DoctorUpdateSchema>; 