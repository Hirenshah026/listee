import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom"; // 1. useLocation import karein

interface UserProtectedRouteProps {
    children: ReactNode;
}

export default function UserProtectedRoute({ children }: UserProtectedRouteProps) {
    const location = useLocation(); // 2. Current path pakadne ke liye

    const checkAuth = () => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        return !!token && role === "chatuser";
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
        // 3. state mein current location bhej dein
        return <Navigate to="/user/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}