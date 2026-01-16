import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeCloseIcon } from "../../icons";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import axios from "axios";

export default function StaffLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            
            const res = await axios.post(
                "http://10.184.233.180:5000/api/auth/staff/login",
                { email, password }
            );

            console.log("LOGIN RESPONSE 👉", res.data);

            if (!res.data.token) {
                setError(res.data.message || "Login failed");
                return;
            }

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", "staff");

            navigate("/staff/dashboard");
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Server error");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-6"
            >
                <div>
                    <h1 className="text-2xl font-semibold">Staff Login</h1>
                    <p className="text-sm text-gray-500">
                        Login to access staff panel
                    </p>
                </div>

                {error && (
                    <div className="text-sm text-red-700 bg-red-100 p-3 rounded">
                        {error}
                    </div>
                )}

                <div>
                    <Label>Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div>
                    <Label>Password</Label>
                    
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                </div>


                <div className="flex items-center justify-between">
                    <Checkbox checked={remember} onChange={setRemember}  className="hidden"/>
                    <Link
                        to="/staff/forgot-password"
                        className="text-sm text-brand-500"
                    >
                        Forgot password?
                    </Link>
                </div>

                <Button type="submit" className="w-full">
                    Login
                </Button>
            </form>
        </div>
    );
}
