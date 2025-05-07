import { UserCircle } from "lucide-react";
import { format } from "date-fns";

export default function TopBar() {
	const today = format(new Date(), "PPP");

	return (
		<div className="flex justify-between items-center p-4 bg-white shadow-md">
			<div className="text-xl font-bold text-blue-700">
				<a href="/">🏥 Smart Hospital</a>
			</div>
			<div className="flex items-center gap-4">
				<span className="text-gray-600">{today}</span>
				<UserCircle className="h-8 w-8 text-gray-700" />
			</div>
		</div>
	);
}
