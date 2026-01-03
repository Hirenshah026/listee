
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/form/input/InputField";
import { EyeCloseIcon, EyeIcon } from "../icons";

interface FormData {
  name: string;
  mobile: string;
  city: string;
  state: string;
  password: string;
}

interface FormErrors {
  name?: string;
  mobile?: string;
  city?: string;
  state?: string;
  password?: string;
}

type AlertType = "success" | "error";

const AstrologerRegister = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    mobile: "",
    city: "",
    state: "",
    password: "",
  });

  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // ================= VALIDATION =================
  const validate = (data: FormData): FormErrors => {
    const newErrors: FormErrors = {};

    if (!data.name.trim() || data.name.length < 3)
      newErrors.name = "Name must be at least 3 characters";

    if (!/^[0-9]{10}$/.test(data.mobile))
      newErrors.mobile = "Mobile must be 10 digits";

    if (!data.city.trim())
      newErrors.city = "City / Village is required";

    if (!data.state)
      newErrors.state = "State is required";

    if (!data.password || data.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    return newErrors;
  };

  // ================= HANDLERS =================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(formData);
    setTouched({
      name: true,
      mobile: true,
      city: true,
      state: true,
      password: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      setAlert({ type: "error", message: "Please fix the errors below ❌" });
      return;
    }

    try {
      setLoading(true);
      setAlert(null);

      const res = await fetch("http://192.168.105.180:5000/api/auth/astro/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "astro" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "astro");
      localStorage.setItem("user", JSON.stringify(data.user));

      setAlert({ type: "success", message: "Registered successfully 🎉 Redirecting..." });
      setTimeout(() => navigate("/astro/home"), 3000);
    } catch (err: any) {
      
      setTimeout(() => {
        setAlert({ type: "error", message: err.message || "Server error ❌" });
      }, 3000);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 3000);
      
    }
  };
   useEffect(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }, []);

  const errors = validate(formData);

  // ================= UI =================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-700">
          Astrologer Registration
        </h2>

        {alert && (
          <div
            className={`mb-4 px-4 py-3 rounded text-sm font-medium ${
              alert.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {alert.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter full name"
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-green-400"
            />
            {touched.name && errors.name && (
              <p className="text-red-500 text-xs">{errors.name}</p>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium mb-1">Mobile Number</label>
            <input
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="10 digit mobile number"
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-green-400"
            />
            {touched.mobile && errors.mobile && (
              <p className="text-red-500 text-xs">{errors.mobile}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium mb-1">City / Village</label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter city or village"
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-green-400"
            />
            {touched.city && errors.city && (
              <p className="text-red-500 text-xs">{errors.city}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-green-400"
            >
              <option value="">Select State</option>
              <option>Uttar Pradesh</option>
              <option>Madhya Pradesh</option>
              <option>Rajasthan</option>
              <option>Bihar</option>
              <option>Maharashtra</option>
            </select>
            {touched.state && errors.state && (
              <p className="text-red-500 text-xs">{errors.state}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password / PIN</label>
            <div className="relative">
              <Input
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeIcon className="size-5 fill-gray-500" />
                ) : (
                  <EyeCloseIcon className="size-5 fill-gray-500" />
                )}
              </span>
            </div>
            {touched.password && errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            className={`w-full py-2 rounded text-white font-semibold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registering...
              </span>
            ) : (
              "Register"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AstrologerRegister;
