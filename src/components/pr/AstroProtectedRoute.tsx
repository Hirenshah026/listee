import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface AstroProtectedRouteProps {
    children: ReactNode;
}

export default function AstroProtectedRoute({ children }: AstroProtectedRouteProps) {
    const checkAuth = () => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        return !!token && role === "astro";
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
        return <Navigate to="/astro/login" replace />;
    }

    return <>{children}</>;
}
