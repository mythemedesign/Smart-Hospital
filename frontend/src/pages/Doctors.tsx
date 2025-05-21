import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import { DoctorForm } from "@/components/doctor/DoctorForm";

interface Doctor {
	_id: string;
	name: string;
	specialty: string;
	email: string;
	phone: string;
	avatarUrl?: string;
}

export default function Doctors() {
	const [doctors, setDoctors] = useState<Doctor[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	const fetchDoctors = async () => {
		try {
			const response = await api.get("http://localhost:3000/api/doctors");
			setDoctors(response.data);
		} catch (error) {
			console.error("Error fetching doctors:", error);
			toast.error("Failed to load doctors");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchDoctors();
	}, []);

	const handleDelete = async (doctorId: string) => {
		if (!confirm("Are you sure you want to delete this doctor?")) {
			return;
		}

		try {
			await api.delete(`http://localhost:3000/api/doctors/${doctorId}`);
			toast.success("Doctor deleted successfully");
			fetchDoctors();
		} catch (error) {
			console.error("Error deleting doctor:", error);
			toast.error("Failed to delete doctor");
		}
	};

	const filteredDoctors = doctors.filter((doctor) =>
		doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
		doctor.phone.includes(searchQuery) ||
		doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Doctors</h1>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>Add New Doctor</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Add New Doctor</DialogTitle>
							<DialogDescription>
								Fill in the doctor's information below.
							</DialogDescription>
						</DialogHeader>
						<DoctorForm
							onSuccess={() => {
								setIsCreateDialogOpen(false);
								fetchDoctors();
							}}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<div className="flex items-center space-x-4">
				<Input
					placeholder="Search doctors..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="max-w-sm"
				/>
			</div>

			{isLoading ? (
				<div className="text-center py-4">Loading...</div>
			) : (
				<div className="border rounded-lg">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Specialty</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredDoctors.map((doctor) => (
								<TableRow key={doctor._id}>
									<TableCell className="font-medium">
										<div className="flex items-center space-x-2">
											{doctor.avatarUrl && (
												<img
													src={doctor.avatarUrl}
													alt={doctor.name}
													className="w-8 h-8 rounded-full"
												/>
											)}
											<span>{doctor.name}</span>
										</div>
									</TableCell>
									<TableCell className="capitalize">{doctor.specialty}</TableCell>
									<TableCell>{doctor.email}</TableCell>
									<TableCell>{doctor.phone}</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8 p-0">
													<span className="sr-only">Open menu</span>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="24"
														height="24"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
														className="h-4 w-4"
													>
														<circle cx="12" cy="12" r="1" />
														<circle cx="19" cy="12" r="1" />
														<circle cx="5" cy="12" r="1" />
													</svg>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => {
														setSelectedDoctor(doctor);
														setIsEditDialogOpen(true);
													}}
												>
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => handleDelete(doctor._id)}
													className="text-red-600"
												>
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Edit Doctor</DialogTitle>
						<DialogDescription>
							Update the doctor's information below.
						</DialogDescription>
					</DialogHeader>
					{selectedDoctor && (
						<DoctorForm
							doctorId={selectedDoctor._id}
							onSuccess={() => {
								setIsEditDialogOpen(false);
								setSelectedDoctor(null);
								fetchDoctors();
							}}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
