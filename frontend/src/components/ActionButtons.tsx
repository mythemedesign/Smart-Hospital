import { Button } from "@/components/ui/button";

export default function ActionButtons() {
	return (
		<div className="flex gap-4 p-4">
			<Button className="bg-blue-600 hover:bg-blue-700 text-white">
				<a href="/new_appointment">+ New Appointment</a>
			</Button>
			<Button className="bg-green-600 hover:bg-green-700 text-white">
				<a href="/patients">View Patients</a>
			</Button>
			<Button className="bg-gray-600 hover:bg-gray-700 text-white">
				<a href="/setting">Settings</a>
			</Button>
		</div>
	);
}
