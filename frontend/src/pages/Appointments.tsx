import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { AppointmentForm } from "@/components/appointment/AppointmentForm";

type Appointment = {
	_id: string;
	date: string;
	time: string;
	status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
	notes: string;
	patientId: { _id: string; name: string };
	doctorId: { _id: string; name: string; specialty?: string };
};

export default function AppointmentsPage() {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const fetchAppointments = async () => {
		try {
			const res = await api.get("http://localhost:3000/api/appointments");
			
			setAppointments(res.data);
		} catch (err) {
			console.error("Error fetching appointments:", err);
			toast.error("Failed to fetch appointments");
		}
	};

	const deleteAppointment = async (id: string) => {
		try {
			await api.delete(`http://localhost:3000/api/appointments/${id}`);
			setAppointments((prev) => prev.filter((a) => a._id !== id));
			toast.success("Appointment deleted successfully");
		} catch (err) {
			console.error("Error deleting appointment:", err);
			toast.error("Failed to delete appointment");
		}
	};

	const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
		try {
			await api.patch(`http://localhost:3000/api/appointments/${id}/status`, { status });
			setAppointments((prev) =>
				prev.map((appt) =>
					appt._id === id ? { ...appt, status } : appt
				)
			);
			toast.success("Appointment status updated successfully");
		} catch (err) {
			console.error("Error updating appointment status:", err);
			toast.error("Failed to update appointment status");
		}
	};

	useEffect(() => {
		fetchAppointments();
	}, []);

	const getStatusColor = (status: Appointment['status']) => {
		switch (status) {
			case 'scheduled':
				return 'bg-blue-500';
			case 'completed':
				return 'bg-green-500';
			case 'cancelled':
				return 'bg-red-500';
			case 'no-show':
				return 'bg-yellow-500';
			case 'rescheduled':
				return 'bg-purple-500';
			default:
				return 'bg-gray-500';
		}
	};

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Appointments</h1>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								New Appointment
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[600px]">
							<DialogHeader>
								<DialogTitle>Create New Appointment</DialogTitle>
							</DialogHeader>
							<AppointmentForm onSuccess={() => {
								setIsDialogOpen(false);
								fetchAppointments();
							}} />
						</DialogContent>
					</Dialog>
				</div>

				{appointments.length === 0 ? (
					<p className="text-muted-foreground">No appointments found.</p>
				) : (
					<div className="grid gap-4">
						{appointments.map((appt) => (
							<Card key={appt._id}>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-lg">
										{format(new Date(appt.date), "PPP")} at {appt.time}
									</CardTitle>
									<Badge className={getStatusColor(appt.status)}>
										{appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
									</Badge>
								</CardHeader>
								<CardContent className="space-y-2">
									<p>
										<strong>Patient:</strong> {appt.patientId?.name || "Unknown"}
									</p>
									<p>
										<strong>Doctor:</strong> {appt.doctorId?.name || "Unknown"}{" "}
										{appt.doctorId?.specialty && `(${appt.doctorId.specialty})`}
									</p>
									{appt.notes && (
										<p>
											<strong>Notes:</strong> {appt.notes}
										</p>
									)}
									<div className="flex gap-2 pt-2">
										<Select
											value={appt.status}
											onValueChange={(value: Appointment['status']) =>
												updateAppointmentStatus(appt._id, value)
											}
										>
											<SelectTrigger className="w-[180px]">
												<SelectValue placeholder="Update status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="scheduled">Scheduled</SelectItem>
												<SelectItem value="completed">Completed</SelectItem>
												<SelectItem value="cancelled">Cancelled</SelectItem>
												<SelectItem value="no-show">No Show</SelectItem>
												<SelectItem value="rescheduled">Rescheduled</SelectItem>
											</SelectContent>
										</Select>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => deleteAppointment(appt._id)}
										>
											Delete
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		
	);
}
