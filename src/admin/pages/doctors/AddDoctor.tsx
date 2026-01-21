import { useState, useEffect } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Switch from "../../../components/form/switch/Switch";
import PageMeta from "../../../components/common/PageMeta";
import { Link } from "react-router-dom";
import axios from "axios";
import { EyeCloseIcon, EyeIcon, EnvelopeIcon } from "../../../icons";
import WhatsappIcon from '../../../icons/whatsapp.png';


interface City {
  _id: string;
  name: string;
  state?: string;
  country?: string;
}

interface FormData {
  city: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  whatsapp_no: string;
  address: string;
  phone2?: string;
  status: boolean;
}

interface Errors {
  city?: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  whatsapp_no?: string;
  address?: string;
}

const AddDoctor = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [cityOptions, setCityOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    city: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    whatsapp_no: "",
    address: "",
    phone2: "",
    status: true,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch cities from API
  const fetchCities = async () => {
    try {
      setLoadingCities(true);
      const { data } = await axios.get("aqua-goat-506711.hostingersite.com/api/cities");
      if (data.success) {
        setCities(data.cities);
        const options = data.cities.map((c: City) => ({ label: c.name, value: c._id }));
        setCityOptions(options);
      }
    } catch (err) {
      console.error("Failed to fetch cities", err);
    } finally {
      setLoadingCities(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, city: value }));
    setErrors((prev) => ({ ...prev, city: undefined }));
  };

  const handleReset = () => {
    setFormData({
      city: "",
      name: "",
      email: "",
      password: "",
      phone: "",
      whatsapp_no: "",
      address: "",
      phone2: "",
      status: true,
    });
    setErrors({});
    setShowPassword(false);
    setMessage(null);
  };

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.name) newErrors.name = "Doctor name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.whatsapp_no) newErrors.whatsapp_no = "WhatsApp number is required";
    if (!formData.address) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const response = await axios.post(
        "aqua-goat-506711.hostingersite.com/api/admin/doctor-register",
        formData
      );
      setMessage({ type: "success", text: "Doctor Registered Successfully!" });
      console.log(response.data);

      setTimeout(() => {
        handleReset();
      }, 5000);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to register doctor. Check console for details." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Doctor Registration" description="Bundelkhand Dental Lab Jhansi" />
      <div className="px-4 py-6">

        <ComponentCard title="Doctor Registration" extra={
          <Link to="/admin/doctors">
            <button className="text-blue-500 border px-3 py-1 rounded hover:bg-blue-50">
               Doctor List
            </button>
          </Link>
        }>
          {/* Message Div */}
          {message && (
            <div
              className={`mb-4 p-3 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Row 1 → City + Name + Password */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <Label>City Name <span className="text-red-500">*</span></Label>
                <Select
                  options={cityOptions}
                  placeholder={loadingCities ? "Loading cities..." : "Select City"}
                  value={formData.city}
                  onChange={handleSelect}
                />
                {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Doctor Name</Label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Enter doctor name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
            </div>

            {/* Row 2 → Email + Phone + WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <div className="relative">
                  <Input
                    type="email"
                    name="email"
                    placeholder="doctor@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-[62px]"
                  />
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    <EnvelopeIcon className="size-6" />
                  </span>
                </div>
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <div className="relative">
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-[62px]"
                  />
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    +91
                  </span>
                </div>
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>WhatsApp Number</Label>
                <div className="relative">
                  <Input
                    type="tel"
                    name="whatsapp_no"
                    placeholder="9876543210"
                    value={formData.whatsapp_no}
                    onChange={handleChange}
                    className="pl-14" // left padding to make space for icon
                  />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-full border-r border-gray-200 dark:border-gray-800">
                    <img src={WhatsappIcon} alt="Whatsapp" className="w-6 h-6 object-contain" />
                  </div>
                </div>
                {errors.whatsapp_no && <p className="text-red-500 text-sm">{errors.whatsapp_no}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <Label>Address</Label>
              <textarea
                name="address"
                placeholder="Enter address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 min-h-[110px]
                focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-gray-800"
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>

            {/* Doctor Status Switch */}
            <div className="flex items-center gap-3">
              <label className="font-medium text-gray-700">Inactive</label>
              <Switch
                checked={formData.status}
                onChange={(v) => setFormData((prev) => ({ ...prev, status: v }))}
              />
              <label className="font-medium text-gray-700">Active</label>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-4 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-10 
                rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium 
                py-2.5 px-10 rounded-lg transition"
              >
                Reset
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
};

export default AddDoctor;
