import { useState, useEffect } from "react";
import { useForm, Control, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/axios";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Define the form schema using Zod based on backend model
const patientFormSchema = z.object({
    // Basic Information
    name: z.string()
        .min(2, "Name must be at least 2 characters long")
        .max(100, "Name cannot exceed 100 characters")
        .regex(/^[a-zA-Z\s-']+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
    
    birthdate: z.coerce.date({
        required_error: "Please select a date",
    }).refine(
            (date) => date <= new Date(),
        "Invalid birthdate."
    ),
    
    gender: z.enum(["male", "female", "other"], {
        required_error: "Please select a gender",
    }),
    
    status: z.enum(["admitted", "discharged", "outpatient"], {
        required_error: "Please select a status",
    }),
    
    // Contact Information
    email: z.string()
        .email("Invalid email format")
        .min(5, "Email must be at least 5 characters long")
        .max(100, "Email cannot exceed 100 characters")
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid email address")
        .optional(),
    
    phone: z.string()
        .regex(/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, "Invalid phone number format")
        .min(10, "Phone number must be at least 10 digits")
        .max(20, "Phone number cannot exceed 20 characters"),
    
    address: z.string()
        .min(5, "Address must be at least 5 characters long")
        .max(200, "Address cannot exceed 200 characters")
        .optional(),
    
    emergencyName: z.string()
        .regex(/^[a-zA-Z\s-']+$/, "Emergency contact name can only contain letters, spaces, hyphens, and apostrophes")
        .max(100, "Emergency contact name cannot exceed 100 characters")
        .optional(),
    
    emergencyPhone: z.string()
        .regex(/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, "Invalid emergency phone number format")
        .max(20, "Emergency phone number cannot exceed 20 characters")
        .optional(),
    
    // Medical Information
    bloodType: z.string()
        .regex(/^(A|B|AB|O)[+-]$/, "Invalid blood type. Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-")
        .optional(),
    
    allergies: z.array(z.string()
        .min(2, "Allergy description must be at least 2 characters long")
        .max(100, "Allergy description cannot exceed 100 characters")
    ).optional(),
    
    medicalHistory: z.array(z.string()
        .min(3, "Medical history entry must be at least 3 characters long")
        .max(200, "Medical history entry cannot exceed 200 characters")
    ).optional(),
    
    treatments: z.array(z.string()
        .min(3, "Treatment description must be at least 3 characters long")
        .max(200, "Treatment description cannot exceed 200 characters")
    ).optional(),
    
    medicalNotes: z.string()
        .max(1000, "Medical notes cannot exceed 1000 characters")
        .optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
    patientId?: string;
    onSuccess?: () => void;
}

export function PatientForm({ patientId, onSuccess }: PatientFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = !!patientId;
    const form = useForm<PatientFormValues>({
        resolver: zodResolver(patientFormSchema),
        defaultValues: {
            name: "",
            birthdate: new Date(), // Changed from empty string to new Date()
            gender: "male" as const,
            status: "outpatient" as const,
            email: "",
            phone: "",
            address: "",
            emergencyName: "",
            emergencyPhone: "",
            bloodType: undefined,
            allergies: [],
            medicalHistory: [],
            treatments: [],
            medicalNotes: "",
        },
    });

    const { control, handleSubmit, formState: { errors } } = form;

    useEffect(() => {
        if (patientId) {
            const fetchPatient = async () => {
                try {
                    const response = await api.get(`http://localhost:3000/api/patients/${patientId}`);
                    const patient = response.data;
                    form.reset({
                        ...patient,
                        // Convert arrays if they're strings
                        allergies: Array.isArray(patient.allergies) ? patient.allergies : [],
                        medicalHistory: Array.isArray(patient.medicalHistory) ? patient.medicalHistory : [],
                        treatments: Array.isArray(patient.treatments) ? patient.treatments : [],
                    });
                } catch (error) {
                    console.error("Error fetching patient:", error);
                    toast.error("Failed to load patient information");
                }
            };
            fetchPatient();
        }
    }, [patientId, form]);

    const onSubmit: SubmitHandler<PatientFormValues> = async (data) => {
        setIsLoading(true);
        try {
            if (isEditing) {
                await api.patch(`http://localhost:3000/api/patients/${patientId}`, data);
                toast.success("Patient updated successfully");
            } else {
                
                await api.post("http://localhost:3000/api/patients", data);
                
                toast.success("Patient created successfully");
            }
            form.reset();
            onSuccess?.();
        } catch (error: any) {
            console.error("Error saving patient:", error);
            toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} patient`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <FormField
                        control={control as unknown as Control<PatientFormValues>}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control as unknown as Control<PatientFormValues>}
                        name="birthdate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Birthdate</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="date" 
                                        {...field}
                                        value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                        onChange={(e) => field.onChange(new Date(e.target.value))}
                                        max={format(new Date(), 'yyyy-MM-dd')}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control as unknown as Control<PatientFormValues>}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    {...field}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control as unknown as Control<PatientFormValues>}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    {...field}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="admitted">Admitted</SelectItem>
                                        <SelectItem value="discharged">Discharged</SelectItem>
                                        <SelectItem value="outpatient">Outpatient</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Contact Information */}
                    <FormField
                        control={control as unknown as Control<PatientFormValues>}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="patient@example.com"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control as unknown as Control<PatientFormValues>}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input
                                        type="tel"
                                        placeholder="+1 (123) 456-7890"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control as unknown as Control<PatientFormValues>}
                        name="address"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="123 Main St, City, Country"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control as unknown as Control<PatientFormValues>}
                        name="emergencyName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Emergency Contact Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Emergency Contact Name"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control as unknown as Control<PatientFormValues>}
                        name="emergencyPhone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Emergency Contact Phone</FormLabel>
                                <FormControl>
                                    <Input
                                        type="tel"
                                        placeholder="+1 (123) 456-7890"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Medical Information */}
                    <FormField
                        control={control as unknown as Control<PatientFormValues>}
                        name="bloodType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Blood Type</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    {...field}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select blood type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="A+">A+</SelectItem>
                                        <SelectItem value="A-">A-</SelectItem>
                                        <SelectItem value="B+">B+</SelectItem>
                                        <SelectItem value="B-">B-</SelectItem>
                                        <SelectItem value="AB+">AB+</SelectItem>
                                        <SelectItem value="AB-">AB-</SelectItem>
                                        <SelectItem value="O+">O+</SelectItem>
                                        <SelectItem value="O-">O-</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control as unknown as Control<PatientFormValues>}
                        name="allergies"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Allergies</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter allergies (one per line)"
                                        className="resize-none"
                                        {...field}
                                        value={field.value?.join('\n') || ""}
                                        onChange={(e) => {
                                            const values = e.target.value
                                                .split('\n')
                                                .map(line => line.trim())
                                                .filter(line => line.length > 0);
                                            field.onChange(values);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control as unknown as Control<PatientFormValues>}
                        name="medicalHistory"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Medical History</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter medical history (one entry per line)"
                                        className="resize-none"
                                        {...field}
                                        value={field.value?.join('\n') || ""}
                                        onChange={(e) => {
                                            const values = e.target.value
                                                .split('\n')
                                                .map(line => line.trim())
                                                .filter(line => line.length > 0);
                                            field.onChange(values);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control as unknown as Control<PatientFormValues>}
                        name="treatments"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Treatments</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter treatments (one per line)"
                                        className="resize-none"
                                        {...field}
                                        value={field.value?.join('\n') || ""}
                                        onChange={(e) => {
                                            const values = e.target.value
                                                .split('\n')
                                                .map(line => line.trim())
                                                .filter(line => line.length > 0);
                                            field.onChange(values);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control as unknown as Control<PatientFormValues>}
                        name="medicalNotes"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Medical Notes</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter medical notes..."
                                        className="resize-none"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                        ? isEditing
                            ? "Updating..."
                            : "Creating..."
                        : isEditing
                            ? "Update Patient"
                            : "Create Patient"}
                </Button>
            </form>
        </Form>
    );
} 