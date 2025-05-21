import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Appointments", href: "/appointments" },
    { name: "Doctors", href: "/doctors" },
    { name: "Patients", href: "/patients" },
];

export default function Layout() {
    const location = useLocation();
    const { user, logout } = useAuth();

    const userInitials = user?.name
        ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
        : "?";

    const userRole = user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : "";

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex flex-shrink-0 items-center">
                                <span className="text-xl font-bold text-gray-900">
                                    Smart Hospital
                                </span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        className={cn(
                                            "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                                            location.pathname === item.href
                                                ? "border-indigo-500 text-gray-900"
                                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-8 w-8 rounded-full"
                                    >
                                        <span className="sr-only">
                                            Open user menu
                                        </span>
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                                            {userInitials}
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <div className="px-4 py-2 text-sm">
                                        <div className="font-medium">
                                            {user?.name}
                                        </div>
                                        <div className="text-gray-500">
                                            {user?.email}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-400">
                                            {userRole}
                                        </div>
                                    </div>
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={logout}
                                    >
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
} 