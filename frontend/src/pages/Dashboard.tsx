import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface DashboardStats {
    doctors: number;
    patients: number;
    appointments: number;
    todayAppointments: number;
}

interface RecentAppointment {
    _id: string;
    patientId: {
        name: string;
    };
    doctorId: {
        name: string;
        specialty: string;
        avatarUrl?: string;
    };
    date: string;
    time: string;
    status: "scheduled" | "completed" | "cancelled";
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        doctors: 0,
        patients: 0,
        appointments: 0,
        todayAppointments: 0,
    });
    const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsResponse, appointmentsResponse] = await Promise.all([
                    api.get("http://localhost:3000/api/stats"),
                    api.get("http://localhost:3000/api/appointments/recent"),
                ]);
                
                setStats(statsResponse.data);
                setRecentAppointments(appointmentsResponse.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Doctors
                        </CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.doctors}</div>
                        <p className="text-xs text-muted-foreground">
                            Active medical professionals
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Patients
                        </CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.patients}</div>
                        <p className="text-xs text-muted-foreground">
                            Registered patients
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Appointments
                        </CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <line x1="16" x2="16" y1="2" y2="6" />
                            <line x1="8" x2="8" y1="2" y2="6" />
                            <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.appointments}</div>
                        <p className="text-xs text-muted-foreground">
                            All-time appointments
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Today's Appointments
                        </CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.todayAppointments}</div>
                        <p className="text-xs text-muted-foreground">
                            Scheduled for today
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Appointments */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Appointments</CardTitle>
                    <CardDescription>
                        Latest appointments in the system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentAppointments.map((appointment) => (
                            <div
                                key={appointment._id}
                                className="flex items-center justify-between space-x-4"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
    
                                        <div className="h-8 w-8 rounded-full bg-muted" />
                                       
                                        <div>
                                            <p className="text-sm font-medium">
                                                {appointment.patientId.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                with Dr. {appointment.doctorId.name} ({appointment.doctorId.specialty})
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(appointment.date).toLocaleString()}
                                    </div>
                                    <div
                                        className={cn(
                                            "rounded-full px-2 py-1 text-xs font-medium",
                                            appointment.status === "scheduled"
                                                ? "bg-blue-100 text-blue-700"
                                                : appointment.status === "completed"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        )}
                                    >
                                        {appointment.status.charAt(0).toUpperCase() +
                                            appointment.status.slice(1)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <Button asChild variant="outline" className="w-full">
                            <Link to="/appointments">View All Appointments</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 