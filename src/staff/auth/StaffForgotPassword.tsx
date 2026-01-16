import { useState } from "react";
import { Link } from "react-router-dom";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import axios from "axios";

export default function StaffResetPassword() {
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Check email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post(
        "https://listee-backend.onrender.com/api/auth/staff/forgot-password",
        { email }
      );

      if (res.data.success) {
        setMessage("Email verified! Enter new password below.");
        setStep("password");
      } else {
        setError(res.data.message || "Email not found");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set new password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://listee-backend.onrender.com/api/auth/staff/reset-password",
        { email, newPassword: password }
      );

      if (res.data.success) {
        setMessage("Password changed successfully! You can now login.");
        setStep("email");
        setEmail("");
        setPassword("");
      } else {
        setError(res.data.message || "Failed to reset password");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={step === "email" ? handleEmailSubmit : handlePasswordSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-6"
      >
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {step === "email" ? "Forgot Password" : "Reset Password"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === "email"
              ? "Enter your registered email to verify."
              : "Enter your new password."}
          </p>
        </div>

        {message && (
          <div className="text-sm text-green-700 bg-green-100 p-3 rounded">
            {message}
          </div>
        )}
        {error && (
          <div className="text-sm text-red-700 bg-red-100 p-3 rounded">
            {error}
          </div>
        )}

        {/* EMAIL STEP */}
        {step === "email" && (
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              
            />
          </div>
        )}

        {/* PASSWORD STEP */}
        {step === "password" && (
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              
            />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Processing..."
            : step === "email"
            ? "Verify Email"
            : "Set Password"}
        </Button>

        {step === "email" && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Remember your password?{" "}
            <Link
              to="/staff/login"
              className="text-brand-500 hover:text-brand-600"
            >
              Login
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}
