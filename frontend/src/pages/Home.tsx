import TopBar from "@/components/TopBar";
import ActionButtons from "@/components/ActionButtons";
import EmergencyAlerts from "@/components/EmergencyAlerts";
import TodaysAppointments from "@/components/TodaysAppointments";

const Home: React.FC = () => {
	return (
		<div className="min-h-screen bg-gray-100">
			<TopBar />
			<div className="p-6 space-y-6">
				<ActionButtons />
				<EmergencyAlerts
					alerts={[
						{ name: "John Doe", issue: "Severe Chest Pain" },
						{ name: "Mary Jane", issue: "Head Trauma" },
					]}
				/>
				<TodaysAppointments
					appointments={[
						{ time: "10:00", name: "Alex Smith", status: "Normal" },
						{ time: "11:30", name: "John Doe", status: "Urgent" },
						{ time: "13:00", name: "Maria Garcia", status: "Normal" },
					]}
				/>
			</div>
		</div>
	);
};

export default Home;
