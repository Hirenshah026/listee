import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Switch from "../../../components/form/switch/Switch";
import { EyeIcon, EyeCloseIcon, EnvelopeIcon } from "../../../icons";
import WhatsappIcon from "../../../icons/whatsapp.png";

interface City {
  _id: string;
  name: string;
}

interface FormData {
  city: string;
  name: string;
  email: string;
  password?: string;
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

const EditDoctor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  // 🔔 Alert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertMessage, setAlertMessage] = useState("");

  // fetch cities
  const fetchCities = async () => {
    try {
      setLoadingCities(true);
      const { data } = await axios.get("http://10.18.209.180:5000/api/cities");
      if (data.success) {
        setCities(data.cities);
        const options = data.cities.map((c: City) => ({
          label: c.name,
          value: c._id,
        }));
        setCityOptions(options);
      }
    } catch (err) {
      console.error("Failed to fetch cities", err);
    } finally {
      setLoadingCities(false);
    }
  };

  // fetch doctor
  const fetchDoctor = async () => {
    try {
      const { data } = await axios.get(`http://10.18.209.180:5000/api/doctors/${id}`);
      if (data.success) {
        const doc = data.doctor;
        setFormData({
          city: doc.city_name,
          name: doc.name,
          email: doc.email,
          password: "",
          phone: doc.phone || "",
          whatsapp_no: doc.whatsapp_no || "",
          address: doc.address || "",
          phone2: doc.phone2 || "",
          status: doc.active,
        });
      }
    } catch (err) {
      console.error("Failed to fetch doctor", err);
    }
  };

  useEffect(() => {
    fetchCities();
    fetchDoctor();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, city: value }));
    setErrors((prev) => ({ ...prev, city: undefined }));
  };

  const validate = () => {
    const newErrors: Errors = {};
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.name) newErrors.name = "Doctor name is required";
    if (!formData.email) newErrors.email = "Email is required";
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
      const payload: any = { ...formData };
      if (!payload.password) delete payload.password;

      await axios.patch(`http://10.18.209.180:5000/api/doctors/${id}`, payload);

      setAlertType("success");
      setAlertMessage("Doctor updated successfully!");
      setShowAlert(true);
    } catch (err) {
      console.error(err);
      setAlertType("error");
      setAlertMessage("Failed to update doctor. Check console for details.");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Edit Doctor" description="Edit Doctor Details" />
      <div className="px-4 py-6">
        <ComponentCard title="Edit Doctor">

          {/* 🔔 Alert */}
          {showAlert && (
            <div
              className={`mb-6 flex items-center justify-between rounded-lg px-4 py-3
              ${alertType === "success"
                  ? "border border-green-300 bg-green-50 text-green-800"
                  : "border border-red-300 bg-red-50 text-red-800"
                }`}
            >
              <span className="font-medium">{alertMessage}</span>
              <button
                onClick={() => setShowAlert(false)}
                className="text-lg font-bold"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Row 1 */}
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
                    placeholder="Enter new password (leave blank to keep current)"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 size-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <div className="relative">
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-[62px]"
                  />
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r px-3.5 py-3">
                    <EnvelopeIcon className="size-6" />
                  </span>
                </div>
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
                    className="pl-14"
                  />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-full border-r border-gray-200 dark:border-gray-800">
                    <img
                      src={WhatsappIcon}
                      alt="Whatsapp"
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                </div>
                {errors.whatsapp_no && (
                  <p className="text-red-500 text-sm">{errors.whatsapp_no}</p>
                )}
              </div>

            </div>

            {/* Address */}
            <div>
              <Label>Address</Label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 min-h-[110px]"
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <label>Inactive</label>
              <Switch
                checked={formData.status}
                onChange={(v) => setFormData((p) => ({ ...p, status: v }))}
              />
              <label>Active</label>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-10 py-2.5 rounded-lg"
              >
                {loading ? "Saving..." : "Update"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/doctors")}
                className="bg-gray-200 px-10 py-2.5 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
};

export default EditDoctor;
