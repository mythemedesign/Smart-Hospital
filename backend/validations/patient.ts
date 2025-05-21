import { z } from "zod";

// Custom error messages
const errorMessages = {
    required: "This field is required",
    invalidEmail: "Please enter a valid email address",
    invalidPhone: "Please enter a valid phone number",
    invalidBloodType: "Blood type must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-",
    nameFormat: "Name can only contain letters, spaces, hyphens, and apostrophes",
    minLength: (field: string, length: number) => `${field} must be at least ${length} characters long`,
    maxLength: (field: string, length: number) => `${field} cannot exceed ${length} characters`,
};

// Phone number regex that matches multiple formats
const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

// Blood type regex
const bloodTypeRegex = /^(A|B|AB|O)[+-]$/;

export const PatientSchema = z.object({
    // Basic Information
    name: z.string()
        .min(2, errorMessages.minLength("Name", 2))
        .max(100, errorMessages.maxLength("Name", 100))
        .regex(/^[a-zA-Z\s\-']+$/, errorMessages.nameFormat)
        .trim(),

    birthdate: z.coerce.date({
            required_error: "Please select a date",
        }).refine(
                (date) => date <= new Date(),
            "Invalid birthdate."
        ),

    gender: z.enum(["male", "female", "other"], {
        errorMap: () => ({ message: "Gender must be one of: male, female, other" })
    }),

    status: z.enum(["admitted", "discharged", "outpatient"], {
        errorMap: () => ({ message: "Status must be one of: admitted, discharged, outpatient" })
    }).default("outpatient"),

    // Contact Information
    email: z.string()
        .email(errorMessages.invalidEmail)
        .max(100, errorMessages.maxLength("Email", 100))
        .toLowerCase()
        .trim(),

    phone: z.string()
        .regex(phoneRegex, errorMessages.invalidPhone)
        .max(20, errorMessages.maxLength("Phone number", 20))
        .trim(),

    address: z.string()
        .min(5, errorMessages.minLength("Address", 5))
        .max(200, errorMessages.maxLength("Address", 200))
        .trim()
        .optional(),

    emergencyName: z.string()
        .regex(/^[a-zA-Z\s\-']+$/, errorMessages.nameFormat)
        .max(100, errorMessages.maxLength("Emergency contact name", 100))
        .trim()
        .optional(),

    emergencyPhone: z.string()
        .regex(phoneRegex, errorMessages.invalidPhone)
        .max(20, errorMessages.maxLength("Emergency phone number", 20))
        .trim()
        .optional(),

    // Medical Information
    bloodType: z.string()
        .regex(bloodTypeRegex, errorMessages.invalidBloodType)
        .toUpperCase()
        .trim()
        .optional(),

    allergies: z.array(
        z.string()
            .min(2, errorMessages.minLength("Allergy description", 2))
            .max(100, errorMessages.maxLength("Allergy description", 100))
            .trim()
    ).optional(),

    medicalHistory: z.array(
        z.string()
            .min(3, errorMessages.minLength("Medical history entry", 3))
            .max(200, errorMessages.maxLength("Medical history entry", 200))
            .trim()
    ).optional(),

    treatments: z.array(
        z.string()
            .min(3, errorMessages.minLength("Treatment description", 3))
            .max(200, errorMessages.maxLength("Treatment description", 200))
            .trim()
    ).optional(),

    medicalNotes: z.string()
        .max(1000, errorMessages.maxLength("Medical notes", 1000))
        .trim()
        .optional(),
});

// Type inference
export type PatientInput = z.infer<typeof PatientSchema>;

// Validation middleware
export const validatePatient = (data: unknown) => {
    return PatientSchema.safeParse(data);
};

// Partial validation for updates
export const PatientUpdateSchema = PatientSchema.partial();
export type PatientUpdateInput = z.infer<typeof PatientUpdateSchema>;

// Validation middleware for updates
export const validatePatientUpdate = (data: unknown) => {
    return PatientUpdateSchema.safeParse(data);
}; 