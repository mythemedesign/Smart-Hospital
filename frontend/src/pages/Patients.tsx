import TopBar from "@/components/TopBar";
import PatientsTable from "@/components/PatientsTable";

export default function Patients() {
	return (
		<div className="min-h-screen bg-gray-100">
			<TopBar />
			<div className="p-6">
				<PatientsTable />
			</div>
		</div>
	);
}
