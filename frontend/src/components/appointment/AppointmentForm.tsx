import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define the form schema using Zod
const appointmentFormSchema = z.object({
    doctorId: z.string({
        required_error: "Please select a doctor",
    }),
    patientId: z.string({
        required_error: "Please select a patient",
    }),
    date: z.date({
        required_error: "Please select a date",
    }).refine(
        (date) => date >= new Date(new Date().setHours(0, 0, 0, 0)),
        "Appointment date cannot be in the past"
    ),
    time: z.string().regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Time must be in HH:MM format (24-hour)"
    ),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

type Doctor = {
    _id: string;
    name: string;
    specialty: string;
};

type Patient = {
    _id: string;
    name: string;
};

interface AppointmentFormProps {
    onSuccess?: () => void;
}

export function AppointmentForm({ onSuccess }: AppointmentFormProps) {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<AppointmentFormValues>({
        resolver: zodResolver(appointmentFormSchema),
        defaultValues: {
            notes: "",
        },
    });

    useEffect(() => {
        const fetchDoctorsAndPatients = async () => {
            try {
                const [doctorsRes, patientsRes] = await Promise.all([
                    api.get("http://localhost:3000/api/doctors"),
                    api.get("http://localhost:3000/api/patients"),
                ]);
                setDoctors(doctorsRes.data);
                setPatients(patientsRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load doctors and patients");
            }
        };

        fetchDoctorsAndPatients();
    }, []);

    const onSubmit = async (data: AppointmentFormValues) => {
        setIsLoading(true);
        try {
            await api.post("http://localhost:3000/api/appointments",data);
            
            toast.success("Appointment created successfully");
            form.reset();
            onSuccess?.();
        } catch (error: any) {
            console.error("Error creating appointment:", error);
            toast.error(error.response?.data?.message || "Failed to create appointment");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Doctor Selection */}
                    <FormField
                        control={form.control}
                        name="doctorId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Doctor</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a doctor" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {doctors.map((doctor) => (
                                            <SelectItem
                                                key={doctor._id}
                                                value={doctor._id}
                                            >
                                                {doctor.name} ({doctor.specialty})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Patient Selection */}
                    <FormField
                        control={form.control}
                        name="patientId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Patient</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a patient" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {patients.map((patient) => (
                                            <SelectItem
                                                key={patient._id}
                                                value={patient._id}
                                            >
                                                {patient.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Date Selection */}
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date: Date) =>
                                                date < new Date(new Date().setHours(0, 0, 0, 0))
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Time Selection */}
                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                    <Input
                                        type="time"
                                        {...field}
                                        placeholder="HH:MM"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Notes */}
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Add any additional notes..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Appointment"}
                </Button>
            </form>
        </Form>
    );
} 