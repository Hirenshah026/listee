import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import axios from "axios";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    api: "",
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.fname.trim()) newErrors.fname = "First name is required";
    if (!formData.lname.trim()) newErrors.lname = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors({ ...errors, ...newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await axios.post("http://10.18.209.180:5000/api/auth/register", formData);

      if (!res.data.success) {
        setErrors({ ...errors, api: res.data.message || "Registration failed" });
        return;
      }

      alert("Registration successful!");
      navigate("/signin");
    } catch (err: any) {
      setErrors({
        ...errors,
        api: err.response?.data?.message || "Something went wrong",
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign up!
            </p>
          </div>

          {/* API Error */}
          {errors.api && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded">
              {errors.api}
            </div>
          )}

          {/* SOCIAL BUTTONS */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 mb-4">
            <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
              {/* Google SVG */}
              Sign up with Google
            </button>
            <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
              {/* X / Twitter SVG */}
              Sign up with X
            </button>
          </div>

          <div className="relative py-3 sm:py-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                Or
              </span>
            </div>
          </div>

          {/* MANUAL REGISTER FORM */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>First Name<span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    name="fname"
                    value={formData.fname}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                  />
                  {errors.fname && <p className="text-red-500 text-sm">{errors.fname}</p>}
                </div>
                <div>
                  <Label>Last Name<span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    name="lname"
                    value={formData.lname}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                  />
                  {errors.lname && <p className="text-red-500 text-sm">{errors.lname}</p>}
                </div>
              </div>

              <div>
                <Label>Email<span className="text-error-500">*</span></Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div>
                <Label>Password<span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>

              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  By creating an account you agree to our{" "}
                  <span className="text-gray-800 dark:text-white/90">Terms</span> and{" "}
                  <span className="text-gray-800 dark:text-white">Privacy Policy</span>
                </p>
              </div>

              <div>
                <Button type="submit" className="w-full">Sign Up</Button>
              </div>

              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 mt-5 sm:text-start">
                Already have an account?{" "}
                <Link to="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
