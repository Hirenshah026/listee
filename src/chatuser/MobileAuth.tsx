import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MobileAuth: React.FC = () => {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // ✅ Clear localStorage ONLY once (on page load)
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (mobile.length !== 10) {
      setMessage("Please enter a valid mobile number");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        "https://aqua-goat-506711.hostingersite.com/api/auth/mobile-check",
        { mobile }
      );

      // ✅ Save to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      console.log("Saved token:", res.data.token);

      setMessage(
        res.data.exists
          ? "Logging you in…"
          : "Creating your account…"
      );

      // ✅ Navigate after short delay
      setTimeout(() => {
        navigate("/astro/list");
      }, 1500);

    } catch (err: any) {
      setMessage(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e7f6f3] to-[#f9fafb] flex flex-col">

      {/* Top Brand */}
      <div className="py-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-[#00a884] flex items-center justify-center shadow-lg">
          <span className="text-white text-2xl font-bold">W</span>
        </div>
        <h1 className="mt-3 text-xl font-semibold text-gray-800">
          WhatsApp
        </h1>
        <p className="text-sm text-gray-500">
          Secure messaging starts here
        </p>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 mt-4">

          <h2 className="text-lg font-medium text-gray-800 text-center">
            Verify your phone number
          </h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            We’ll send you a confirmation code
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">

            {/* Phone Input */}
            <div className="flex gap-3">
              <div className="w-20 flex items-center justify-center border rounded-lg bg-gray-50 text-gray-700 font-medium">
                🇮🇳 +91
              </div>

              <input
                type="tel"
                maxLength={10}
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Phone number"
                className="flex-1 border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00a884]"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00a884] hover:bg-[#029e7a] text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Next"}
            </button>
          </form>

          {message && (
            <p className="mt-5 text-center text-sm text-gray-600">
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pb-6 text-center text-xs text-gray-400">
        from Meta
      </div>
    </div>
  );
};

export default MobileAuth;
