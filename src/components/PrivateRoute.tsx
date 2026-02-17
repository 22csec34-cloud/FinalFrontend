import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { toast } from "sonner";

export const PrivateRoute = () => {
    const { isAuthenticated, logout, token } = useAuth();

    // Simple token expiry check
    useEffect(() => {
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp * 1000 < Date.now()) {
                    logout();
                    toast.error("Session expired. Please login again.");
                }
            } catch (e) {
                logout();
            }
        }
    }, [token, logout]);

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
