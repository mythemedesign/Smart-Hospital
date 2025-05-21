import { useState, useEffect } from "react";
import { useForm, useFieldArray, SubmitHandler, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
const DAYS_OF_WEEK = [
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
    day: z.enum(DAYS_OF_WEEK, {
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
        path: ['endTime']
    }
);

// Define the form schema type
const doctorFormSchema = z.object({
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

type DoctorFormSchema = z.infer<typeof doctorFormSchema>;

interface DoctorFormProps {
    doctorId?: string;
    onSuccess?: () => void;
}

export function DoctorForm({ doctorId, onSuccess }: DoctorFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = !!doctorId;

    const form = useForm<DoctorFormSchema>({
        resolver: zodResolver(doctorFormSchema) as any, // Type assertion needed due to complex generic types
        defaultValues: {
            name: "",
            specialty: validSpecialties[0], // Set a default value
            email: "",
            phone: "",
            avatarUrl: "",
            availableSlots: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "availableSlots",
    });

    useEffect(() => {
        if (doctorId) {
            const fetchDoctor = async () => {
                try {
                    const response = await api.get(`http://localhost:3000/api/doctors/${doctorId}`);
                    const doctor = response.data;
                    
                    form.reset({
                        name: doctor.name,
                        specialty: doctor.specialty,
                        email: doctor.email,
                        phone: doctor.phone,
                        avatarUrl: doctor.avatarUrl || "",
                        availableSlots: doctor.availableSlots || [],
                    });
                } catch (error) {
                    console.error("Error fetching doctor:", error);
                    toast.error("Failed to load doctor information");
                }
            };
            fetchDoctor();
        }
    }, [doctorId, form]);

    const onSubmit: SubmitHandler<DoctorFormSchema> = async (data) => {
        setIsLoading(true);
        try {
            if (isEditing) {
                
                await api.patch(`http://localhost:3000/api/doctors/${doctorId}`, data);
                toast.success("Doctor updated successfully");
            } else {
                await api.post("http://localhost:3000/api/doctors", data);
                toast.success("Doctor created successfully");
            }
            form.reset();
            onSuccess?.();
        } catch (error: any) {
            console.error("Error saving doctor:", error);
            toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} doctor`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Dr. John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Specialty */}
                    <FormField
                        control={form.control}
                        name="specialty"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Specialty</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    {...field}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a specialty" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {validSpecialties.map((specialty) => (
                                            <SelectItem
                                                key={specialty}
                                                value={specialty}
                                            >
                                                {specialty}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="doctor@hospital.com"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Phone */}
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input
                                        type="tel"
                                        placeholder="+1234567890"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Avatar URL */}
                    <FormField
                        control={form.control}
                        name="avatarUrl"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Avatar URL (Optional)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="url"
                                        placeholder="https://example.com/avatar.jpg"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Availability Slots */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Availability</h3>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ day: 'Monday', startTime: '09:00', endTime: '17:00' })}
                        >
                            Add Time Slot
                        </Button>
                    </div>

                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <FormField
                                control={form.control}
                                name={`availableSlots.${index}.day`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Day</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select day" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {DAYS_OF_WEEK.map((day) => (
                                                    <SelectItem key={day} value={day}>
                                                        {day}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`availableSlots.${index}.startTime`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`availableSlots.${index}.endTime`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => remove(index)}
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                        ? isEditing
                            ? "Updating..."
                            : "Creating..."
                        : isEditing
                            ? "Update Doctor"
                            : "Create Doctor"}
                </Button>
            </form>
        </Form>
    );
} 