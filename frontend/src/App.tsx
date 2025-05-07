import Home from "./pages/Home.tsx";
import Patients from "./pages/Patients.tsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/patients" element={<Patients />} />
				{/* Add more routes as needed */}
				{/* <Route path="/appointments" element={<Appointments />} />
				<Route path="/settings" element={<Settings />} />
				<Route path="/emergency-alerts" element={<EmergencyAlerts />} />

				<Route path="/todays-appointments" element={<TodaysAppointments />} />
				<Route path="/add-appointment" element={<AddAppointment />} />
				<Route path="/view-appointment/:id" element={<ViewAppointment />} />
				<Route path="/edit-appointment/:id" element={<EditAppointment />} />

				<Route path="/edit-patient/:id" element={<EditPatient />} />
				<Route path="/patient/:id" element={<PatientDetails />} />
				<Route path="/add-patient" element={<AddPatient />} />
				<Route path="/view-patient/:id" element={<ViewPatient />} /> */}
			</Routes>
		</Router>
	);
};
export default App;
