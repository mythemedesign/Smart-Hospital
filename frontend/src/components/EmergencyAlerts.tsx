interface Alert {
	name: string;
	issue: string;
}

export default function EmergencyAlerts({ alerts }: { alerts: Alert[] }) {
	return (
		<div className="bg-red-100 p-4 rounded-xl shadow-inner">
			<h2 className="text-xl font-semibold text-red-700 mb-3">
				🛑 Emergency Alerts
			</h2>
			<ul className="space-y-2">
				{alerts.map((alert, index) => (
					<li key={index} className="text-red-800 font-medium">
						- {alert.name}: {alert.issue}
					</li>
				))}
			</ul>
		</div>
	);
}
