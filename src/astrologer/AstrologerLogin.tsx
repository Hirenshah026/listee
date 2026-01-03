import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/form/input/InputField";
import { EyeCloseIcon, EyeIcon } from "../icons";

interface FormData {
  mobile: string;
  password: string;
}

interface FormErrors {
  mobile?: string;
  password?: string;
}

type AlertType = "success" | "error";

const AstrologerLogin = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    mobile: "",
    password: "",
  });

  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // ================= VALIDATION =================
  const validate = (data: FormData): FormErrors => {
    const errors: FormErrors = {};

    if (!/^[0-9]{10}$/.test(data.mobile))
      errors.mobile = "Mobile number must be 10 digits";

    if (!data.password || data.password.length < 6)
      errors.password = "Password must be at least 6 characters";

    return errors;
  };

  // ================= HANDLERS =================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validate(formData);
    setTouched({ mobile: true, password: true });

    if (Object.keys(errors).length > 0) {
      setAlert({ type: "error", message: "Please fix the errors ❌" });
      return;
    }

    try {
      setLoading(true);
      setAlert(null);

      const res = await fetch("http://https://listee-backend.onrender.com:5000/api/auth/astro/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "astro");
      

      setAlert({ type: "success", message: "Login successful 🎉 Redirecting..." });
      setTimeout(() => navigate("/astro/home"), 2000);
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Server error ❌" });
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  const errors = validate(formData);

  useEffect(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }, []);
  // ================= UI =================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-700">
          Astrologer Login
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
                placeholder="Enter password"
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
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AstrologerLogin;
