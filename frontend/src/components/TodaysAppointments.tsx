interface Appointment {
	time: string;
	name: string;
	status: string;
}

export default function TodaysAppointments({
	appointments,
}: {
	appointments: Appointment[];
}) {
	return (
		<div className="bg-white p-4 rounded-xl shadow-md mt-6">
			<h2 className="text-xl font-semibold text-gray-700 mb-3">
				📅 Today's Appointments
			</h2>
			<ul className="space-y-2">
				{appointments.map((appointment, index) => (
					<li key={index} className="flex justify-between text-gray-800">
						<span>
							{appointment.time} - {appointment.name}
						</span>
						<span
							className={`text-sm px-2 py-1 rounded-full ${
								appointment.status === "Urgent"
									? "bg-red-200 text-red-700"
									: "bg-green-200 text-green-700"
							}`}
						>
							{appointment.status}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}
