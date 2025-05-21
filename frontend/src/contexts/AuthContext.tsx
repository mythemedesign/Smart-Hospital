import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { toast } from "sonner";

interface User {
    id: string;
    name: string;
    email: string;
    role: "admin" | "staff";
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                try {
                    api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
                    const response = await api.get("http://localhost:3000/api/users/me");
                    setUser(response.data);
                    setToken(storedToken);
                } catch (error) {
                    localStorage.removeItem("token");
                    delete api.defaults.headers.common["Authorization"];
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post("http://localhost:3000/api/users/login", { email, password });
            const { token, user } = response.data;

            localStorage.setItem("token", token);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            setToken(token);
            setUser(user);
            toast.success("Login successful");
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Login failed");
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
        setToken(null);
        setUser(null);
        navigate("/login");
        toast.success("Logged out successfully");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
} 