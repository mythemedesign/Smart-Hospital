import { Card, CardContent } from "@/components/ui/card";

type Doctor = {
	_id: string;
	name: string;
	specialty: string;
	email?: string;
	phone?: string;
};

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
	return (
		<Card className="w-full max-w-md mx-auto my-2">
			<CardContent className="p-4">
				<h2 className="text-lg font-semibold">{doctor.name}</h2>
				<p className="text-sm text-green-600">{doctor.specialty}</p>
				{doctor.email && <p className="text-sm">📧 {doctor.email}</p>}
				{doctor.phone && <p className="text-sm">📞 {doctor.phone}</p>}
			</CardContent>
		</Card>
	);
}
