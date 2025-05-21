import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Doctors from "@/pages/Doctors";
import Patients from "@/pages/Patients";
import Appointments from "@/pages/Appointments";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" />;
	}

	return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	if (!user || user.role !== "admin") {
		return <Navigate to="/dashboard" />;
	}

	return <>{children}</>;
}

function AppRoutes() {
	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route
				path="/"
				element={
					<ProtectedRoute>
						<Layout />
					</ProtectedRoute>
				}
			>
				<Route index element={<Navigate to="/dashboard" replace />} />
				<Route path="dashboard" element={<Dashboard />} />
				<Route path="appointments" element={<Appointments />} />
				<Route
					path="doctors"
					element={
						<AdminRoute>
							<Doctors />
						</AdminRoute>
					}
				/>
				<Route
					path="patients"
					element={
						<AdminRoute>
							<Patients />
						</AdminRoute>
					}
				/>
			</Route>
		</Routes>
	);
}

export default function App() {
	return (
		<Router>
			<AuthProvider>
				<AppRoutes />
				<Toaster />
			</AuthProvider>
		</Router>
	);
}
