import { useEffect, useState } from "react";
import axios from "axios";
import DataTable, { TableColumn } from "react-data-table-component";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import Switch from "../../../components/form/switch/Switch";
import { EyeCloseIcon, EyeIcon, EnvelopeIcon } from "../../../icons";

interface Staff {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  active: boolean;
  password: string,
  createdAt?: string;
}

interface FormData {
  name: string;
  email: string;
  phone?: string;
  role: string;
  password: string,
  active: boolean;
}

interface Role {
  _id: string;
  name: string;
  active: boolean;
}

const API_URL = "http://localhost:5000/api/staff";
const ROLES_API = "http://localhost:5000/api/roles";

const StaffManagement = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    active: true,
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch staff
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL);
      if (data.success) setStaffList(data.staff);
    } catch {
      setMessage("Failed to load staff");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const { data } = await axios.get(ROLES_API);
      if (data.success) {
        const activeRoles = data.roles.filter((role: Role) => role.active);
        setRoles(activeRoles);
        if (!formData.role && activeRoles.length > 0) {
          setFormData((prev) => ({ ...prev, role: activeRoles[0].name }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchRoles();
  }, []);

  // Handle form input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSwitch = (value: boolean) => {
    setFormData((prev) => ({ ...prev, active: value }));
  };

  // Validate email format
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // Dot ke baad minimum 2 chars
    return regex.test(email);
  };

  const validate = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email))
      newErrors.email = "Invalid email format (e.g., abc@example.com)";
    if (!formData.role) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add / Edit submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editingId) {
        await axios.patch(`${API_URL}/${editingId}`, formData);
        setMessage("Staff updated successfully");
        setMessageType("success");
      } else {
        await axios.post(API_URL, formData);
        setMessage("Staff added successfully");
        setMessageType("success");
      }
      fetchStaff();
      handleReset();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(err.response.data.message); // Server validation error
      } else {
        setMessage("Error saving staff");
      }
      setMessageType("error");
    }
  };

  const handleEdit = (staff: Staff) => {
    setEditingId(staff._id);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      password: staff.password,
      active: staff.active,
    });
    window.scrollTo(0, 0);
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: roles.length > 0 ? roles[0].name : "",
      password: "",
      active: true,
    });
    setErrors({});
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await axios.patch(`${API_URL}/${id}/active`, { active: !current });
      setMessage("Status updated");
      setMessageType("success");
      fetchStaff();
    } catch {
      setMessage("Failed to update status");
      setMessageType("error");
    }
  };

  const formatDateTime = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const customStyles = {
    rows: { style: { fontSize: "15px", minHeight: "60px" } },
    headCells: { style: { fontSize: "16px", fontWeight: "700", backgroundColor: "#f3f4f6" } },
    cells: { style: { fontSize: "15px" } },
    table: { style: { borderRadius: "10px", overflow: "hidden" } },
    pagination: { style: { fontSize: "15px", padding: "10px" } },
  };

  const columns: TableColumn<Staff>[] = [
    { name: "#", cell: (_row, index) => index + 1, width: "70px" },
    { name: "Role", selector: (row) => row.role, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Email", selector: (row) => row.email },
    { name: "Phone", selector: (row) => row.phone || "-" },
    { name: "Created At", selector: (row) => formatDateTime(row.createdAt), sortable: true },
    {
      name: "Active",
      cell: (row) => (
        <Switch checked={row.active} onChange={() => toggleActive(row._id, row.active)} />
      ),
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button onClick={() => handleEdit(row)} className="bg-yellow-500 px-3 py-1 rounded">
          Edit
        </button>
      ),
      center: true,
    },
  ];

  return (
    <>
      <PageMeta title="Staff Management" description="Admin Panel for Staff" />
      <div className="px-4 py-6 space-y-6">
        {message && (
          <div className={`flex justify-between items-center p-3 rounded ${messageType === "success"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
            }`}>
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-xl font-bold leading-none">
              ×
            </button>
          </div>
        )}

        <ComponentCard title={editingId ? "Edit Staff" : "Add Staff"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Role First */}
              <div>
                <Label>Role</Label>
                <Select
                  options={roles.map((r) => ({ label: r.name, value: r.name }))}
                  value={formData.role}
                  onChange={(value: string) =>
                    setFormData((prev) => ({ ...prev, role: value }))
                  }
                />
                {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
              </div>

              <div>
                <Label>Name</Label>
                <Input type="text" name="name" placeholder="Enter name" value={formData.name} onChange={handleChange} />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div>
                <Label>Email</Label>

                <div className="relative">
                  <Input type="email" name="email" placeholder="Enter email" value={formData.email} onChange={handleChange} className="pl-[62px]" />
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    <EnvelopeIcon className="size-6" />
                  </span>
                </div>
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div>
                <Label>Phone</Label>
                <div className="relative">
                  <Input type="tel" name="phone" placeholder="Optional" value={formData.phone} onChange={handleChange} className="pl-[62px]" />
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    +91
                  </span>
                </div>

              </div>
              <div>
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

            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-700">Inactive</span>
              <Switch checked={formData.active} onChange={handleSwitch} />
              <span className="font-medium text-gray-700">Active</span>
            </div>

            <div className="flex items-center gap-4 pt-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-10 rounded-lg">
                {editingId ? "Update" : "Add"}
              </button>
              <button type="button" onClick={handleReset} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-10 rounded-lg">
                Reset
              </button>
            </div>
          </form>
        </ComponentCard>

        <ComponentCard title="Staff List">
          <DataTable
            columns={columns}
            data={staffList}
            progressPending={loading}
            pagination
            highlightOnHover
            striped
            noDataComponent="No staff found"
            customStyles={customStyles}
          />
        </ComponentCard>
      </div>
    </>
  );
};

export default StaffManagement;
