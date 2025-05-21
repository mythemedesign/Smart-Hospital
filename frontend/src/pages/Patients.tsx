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

import { PatientForm } from "@/components/patient/PatientForm";
import { formatDate } from "@/lib/utils";

import "../index.css";
interface Patient {
	_id: string;
	name: string;
	email: string;
	phone: string;
	dateOfBirth: string;
	gender: string;
	address: string;
	avatarUrl?: string;
}

export default function Patients() {
	const [patients, setPatients] = useState<Patient[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	const fetchPatients = async () => {
		try {
			const response = await api.get("http://localhost:3000/api/patients");
			setPatients(response.data);
		} catch (error) {
			console.error("Error fetching patients:", error);
			toast.error("Failed to load patients");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchPatients();
	}, []);

	const handleDelete = async (patientId: string) => {
		if (!confirm("Are you sure you want to delete this patient?")) {
			return;
		}

		try {
			await api.delete(`http://localhost:3000/api/patients/${patientId}`);
			toast.success("Patient deleted successfully");
			fetchPatients();
		} catch (error) {
			console.error("Error deleting patient:", error);
			toast.error("Failed to delete patient");
		}
	};

	const filteredPatients = patients.filter((patient) =>
		patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
		patient.phone.includes(searchQuery)
	);

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Patients</h1>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					
					<DialogTrigger asChild>
						<Button>Add New Patient</Button>
					</DialogTrigger>
				
					<DialogContent className="max-w-2xl DialogContent">
						<DialogHeader>
							<DialogTitle>Add New Patient</DialogTitle>
							<DialogDescription>
								Fill in the patient's information below.
							</DialogDescription>
						</DialogHeader>
						<PatientForm
							onSuccess={() => {
								setIsCreateDialogOpen(false);
								fetchPatients();
							}}
						/>
					</DialogContent>
					
				</Dialog>
			</div>

			<div className="flex items-center space-x-4">
				<Input
					placeholder="Search patients..."
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
								<TableHead>Email</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead>Date of Birth</TableHead>
								<TableHead>Gender</TableHead>
								<TableHead>Address</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredPatients.map((patient) => (
								<TableRow key={patient._id}>
									<TableCell className="font-medium">
										<div className="flex items-center space-x-2">
											{patient.avatarUrl && (
												<img
													src={patient.avatarUrl}
													alt={patient.name}
													className="w-8 h-8 rounded-full"
												/>
											)}
											<span>{patient.name}</span>
										</div>
									</TableCell>
									<TableCell>{patient.email}</TableCell>
									<TableCell>{patient.phone}</TableCell>
									<TableCell>{formatDate(patient.dateOfBirth)}</TableCell>
									<TableCell className="capitalize">{patient.gender}</TableCell>
									<TableCell>{patient.address}</TableCell>
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
														setSelectedPatient(patient);
														setIsEditDialogOpen(true);
													}}
												>
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => handleDelete(patient._id)}
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
				<DialogContent className="max-w-2xl DialogContent">
					<DialogHeader>
						<DialogTitle>Edit Patient</DialogTitle>
						<DialogDescription>
							Update the patient's information below.
						</DialogDescription>
					</DialogHeader>
					{selectedPatient && (
						<PatientForm
							patientId={selectedPatient._id}
							onSuccess={() => {
								setIsEditDialogOpen(false);
								setSelectedPatient(null);
								fetchPatients();
							}}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
