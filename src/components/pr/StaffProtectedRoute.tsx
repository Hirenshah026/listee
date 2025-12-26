import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface StaffProtectedRouteProps {
    children: ReactNode;
}

export default function StaffProtectedRoute({ children }: StaffProtectedRouteProps) {
    const checkAuth = () => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        return !!token && role === "staff";
    };

    const [isStaff, setIsStaff] = useState(checkAuth());

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === "token" || event.key === "role") {
                setIsStaff(checkAuth());
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    if (!isStaff) {
        return <Navigate to="/staff/login" replace />;
    }

    return <>{children}</>;
}
