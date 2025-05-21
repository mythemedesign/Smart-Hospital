import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";

type Patient = {
	id: string;
	name: string;
	age: number;
	status: "Critical" | "Stable";
};
export default function PatientsTable() {
	const [searchTerm, setSearchTerm] = useState("");
	const navigate = useNavigate();

	const [patients, setPatients] = useState<Patient[]>([]);

	// Fetch patients on component mount
	useEffect(() => {
		const fetchPatients = async () => {
			try {
				const res = await api.get("http://localhost:3000/api/patients");
				setPatients(res.data);
			} catch (err) {
				console.error("Error fetching patients:", err);
			}
		};
		fetchPatients();
	}, []);

	const filteredPatients = patients.filter((patient: Patient) =>
		patient.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="bg-white p-6 rounded-xl shadow-md">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-semibold text-gray-700">👩‍⚕️ Patient List</h2>
				<input
					type="text"
					placeholder="Search by name..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="border p-2 rounded-md w-60 focus:ring focus:ring-blue-300"
				/>
			</div>

			<table className="min-w-full table-auto">
				<thead>
					<tr className="bg-gray-100">
						<th className="px-4 py-2 text-left text-gray-600">Name</th>
						<th className="px-4 py-2 text-left text-gray-600">Age</th>
						<th className="px-4 py-2 text-left text-gray-600">Status</th>
						<th className="px-4 py-2 text-left text-gray-600">Actions</th>
					</tr>
				</thead>
				<tbody>
					{filteredPatients.map((patient) => (
						<tr key={patient.id} className="border-b">
							<td className="px-4 py-2">{patient.name}</td>
							<td className="px-4 py-2">{patient.age}</td>
							<td className="px-4 py-2">
								<span
									className={`px-2 py-1 rounded-full text-sm ${
										patient.status === "Critical"
											? "bg-red-200 text-red-800"
											: "bg-green-200 text-green-800"
									}`}
								>
									{patient.status}
								</span>
							</td>
							<td className="px-4 py-2 space-x-2">
								<button
									className="text-blue-600 hover:underline"
									onClick={() => navigate(`/patients-view/${patient.id}`)}
								>
									View
								</button>
								<button
									className="text-green-600 hover:underline"
									onClick={() => navigate(`/patients-edit/${patient.id}`)}
								>
									Edit
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{filteredPatients.length === 0 && (
				<div className="text-center text-gray-500 mt-6">No patients found.</div>
			)}
		</div>
	);
}
