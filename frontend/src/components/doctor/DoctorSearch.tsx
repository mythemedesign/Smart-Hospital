import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import DoctorCard from "./DoctorCard";
import api from "@/lib/axios";

type Doctor = {
	_id: string;
	name: string;
	specialty: string;
	email?: string;
	phone?: string;
};

export default function DoctorSearch() {
	const [query, setQuery] = useState("");
	const [doctors, setDoctors] = useState<Doctor[]>([]);

	const fetchDoctors = async () => {
		try {
			const res = await api.get(
				`http://localhost:3000/api/doctors/search?name=${query}`
			);
			setDoctors(res.data);
		} catch (err) {
			console.error("Search failed", err);
			setDoctors([]);
		}
	};
	useEffect(() => {
		const timeout = setTimeout(fetchDoctors, 500);
		return () => clearTimeout(timeout);
	}, [query]);

	return (
		<div className="my-6">
			<Input
				placeholder="Search doctors by name..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
			/>
			<div className="mt-4 space-y-3">
				{doctors.length === 0 && (
					<p className="text-gray-500">No doctors found</p>
				)}
				{doctors.map((doc) => (
					<DoctorCard key={doc._id} doctor={doc} />
				))}
			</div>
		</div>
	);
}
