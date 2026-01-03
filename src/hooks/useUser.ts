import { useEffect, useState, useCallback } from "react";
import axios from "axios";

// 👇 User type
type LoggedUser = {
  _id: string;
  name: string;
  email?: string;
  image?: string;
  role?: string;
  experience?: number;
  rating?: number;
  about?: string;
};

export default function useUser() {
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role") || "admin";
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get(
        "http://https://listee-backend.onrender.com:5000/api/doctor-panel-profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            role: role,
          },
        }
      );


      setUser(res.data.user);
    } catch (err) {
      console.error("User fetch error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = () => {
    setLoading(true);
    fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, refreshUser };
}
