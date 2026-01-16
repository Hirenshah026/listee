import { useEffect, useState } from "react";
import axios from "axios";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";

import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import Switch from "../../../components/form/switch/Switch";
import { EyeCloseIcon, EyeIcon, EnvelopeIcon } from "../../../icons";
/* ================= INTERFACES ================= */
interface City {
  _id: string;
  name: string;
  active: boolean;
}

interface Area {
  _id: string;
  name: string;
  active: boolean;
}

interface MarketingPerson {
  _id: string;
  name: string;
  phone: string;
  email: string;
  city: City;
  area: Area;
  active: boolean;
}

/* ================= API ================= */
const CITY_API = "https://listee-backend.onrender.com:5000/api/cities";
const AREA_API = "https://listee-backend.onrender.com:5000/api/areas";
const PERSON_API = "https://listee-backend.onrender.com:5000/api/marketing-persons";

/* ================= TABLE STYLE ================= */
const customStyles: TableStyles = {
  headRow: { style: { backgroundColor: "#f3f4f6", fontWeight: "600", fontSize: "14px" } },
  cells: { style: { fontSize: "14px", paddingTop: "8px", paddingBottom: "8px" } },
};

/* ================= VALIDATORS ================= */
const isValidPhone = (phone: string) => /^\d{10}$/.test(phone);
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const MarketingPersonList = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [persons, setPersons] = useState<MarketingPerson[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    area?: string;
  }>({});

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    area: "",
    active: true,
  });

  /* ================= FETCH ================= */
  const fetchCities = async () => {
    const { data } = await axios.get(CITY_API);
    if (data.success) setCities(data.cities.filter((c: City) => c.active));
  };

  const fetchAreasByCity = async (cityId: string) => {
    const { data } = await axios.get(`${AREA_API}?city=${cityId}`);
    if (data.success) setAreas(data.areas.filter((a: Area) => a.active));
  };

  const fetchPersons = async () => {
    setLoading(true);
    const { data } = await axios.get(PERSON_API);
    if (data.success) setPersons(data.persons);
    setLoading(false);
  };

  useEffect(() => {
    fetchCities();
    fetchPersons();
  }, []);

  /* ================= COMMON CHANGE HANDLER ================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  /* ================= HANDLERS ================= */
  const resetForm = () => {
    setEditingId(null);
    setAreas([]);
    setErrors({});
    setFormData({
      name: "",
      phone: "",
      email: "",
      city: "",
      area: "",
      active: true,
    });
  };

  const handleCitySelect = (value: string) => {
    setFormData((p) => ({ ...p, city: value, area: "" }));
    setErrors((p) => ({ ...p, city: undefined, area: undefined }));
    fetchAreasByCity(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (!isValidPhone(formData.phone)) newErrors.phone = "Phone must be 10 digits";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!isValidEmail(formData.email)) newErrors.email = "Invalid email";

    if (!formData.city) newErrors.city = "City is required";
    if (!formData.area) newErrors.area = "Area is required";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${PERSON_API}/${editingId}`, {
          ...formData,
          cityId: formData.city,
          areaId: formData.area,
        });
        setMessage({ type: "success", text: "Marketing person updated" });
      } else {
        await axios.post(PERSON_API, {
          ...formData,
          cityId: formData.city,
          areaId: formData.area,
        });
        setMessage({ type: "success", text: "Marketing person added" });
      }

      resetForm();
      fetchPersons();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Something went wrong",
      });
    }
  };

  const handleEdit = (row: MarketingPerson) => {
    setEditingId(row._id);
    setErrors({});
    setFormData({
      name: row.name,
      phone: row.phone,
      email: row.email,
      city: row.city._id,
      area: row.area._id,
      active: row.active,
    });
    fetchAreasByCity(row.city._id);
  };

  const openDelete = (row: MarketingPerson) => {
    setDeleteId(row._id);
    setDeleteName(row.name);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await axios.delete(`${PERSON_API}/${deleteId}`);
    setMessage({ type: "success", text: `"${deleteName}" deleted successfully` });
    fetchPersons();
    setShowDelete(false);
  };

  const toggleStatus = async (id: string) => {
    await axios.patch(`${PERSON_API}/${id}/toggle`);
    fetchPersons();
  };

  /* ================= TABLE ================= */
  const columns: TableColumn<MarketingPerson>[] = [
    { name: "#", cell: (_row, index) => index + 1, width: "70px" },
    { name: "Name", selector: (r) => r.name },
    { name: "Phone", selector: (r) => r.phone },
    { name: "City", selector: (r) => r.city?.name },
    { name: "Area", selector: (r) => r.area?.name },
    {
      name: "Active",
      cell: (r) => (
        <Switch checked={r.active} onChange={() => toggleStatus(r._id)} />
      ),
      center: true,
    },
    {
      name: "Actions",
      cell: (r) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(r)} className="px-2 py-1 bg-yellow-400 rounded">
            Edit
          </button>
          <button onClick={() => openDelete(r)} className="px-2 py-1 bg-red-600 text-white rounded">
            Delete
          </button>
        </div>
      ),
      center: true,
    },
  ];

  /* ================= RENDER ================= */
  return (
    <>
      <PageMeta title="Marketing Person Management" description="Admin Panel" />

      {message && (
        <div className={`mx-4 mt-4 px-4 py-2 rounded ${message.type === "success"
          ? "bg-green-200 text-green-800"
          : "bg-red-200 text-red-800"
          }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {/* FORM */}
        <ComponentCard title={editingId ? "Edit Marketing Person" : "Add Marketing Person"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>City</Label>
              <Select
                options={cities.map(c => ({ value: c._id, label: c.name }))}
                placeholder="Select City"
                value={formData.city}
                onChange={handleCitySelect}
              />
              {errors.city && <div className="text-red-500 text-sm">{errors.city}</div>}
            </div>

            <div>
              <Label>Area</Label>
              <Select
                options={areas.map(a => ({ value: a._id, label: a.name }))}
                placeholder={formData.city ? "Select Area" : "Select City first"}
                value={formData.area}
                onChange={(v) => { setFormData(p => ({ ...p, area: v })); setErrors(p => ({ ...p, area: undefined })); }}
                disabled={!formData.city}
              />
              {errors.area && <div className="text-red-500 text-sm">{errors.area}</div>}
            </div>
            <div>
              <Label>Name</Label>
              <Input type="text" name="name" placeholder="Enter name" value={formData.name} onChange={handleChange} />
              {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
            </div>

            <div>
              <Label>Phone</Label>
              <div className="relative">
                <Input
                  type="text"
                  name="phone"
                  placeholder="Enter 10 digit phone"
                  value={formData.phone}
                  className="pl-[62px]"
                  onChange={(e: any) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setFormData((p) => ({ ...p, phone: val }));
                    setErrors((p) => ({ ...p, phone: undefined }));
                  }}
                />
                <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  +91
                </span>
              </div>

              {errors.phone && <div className="text-red-500 text-sm">{errors.phone}</div>}
            </div>

            <div>
              <Label>Email</Label>
              <div className="relative">
                <Input type="email" name="email" placeholder="Enter email" value={formData.email} onChange={handleChange} className="pl-[62px]" />
                <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <EnvelopeIcon className="size-6" />
                </span>
              </div>

              {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
            </div>

            

            <div>
              <Label>Status</Label>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-600">Inactive</span>
                <Switch checked={formData.active} onChange={v => setFormData(p => ({ ...p, active: v }))} />
                <span className="text-sm text-gray-600">Active</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? "Update" : "Add"}</button>
              <button type="button" onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded">Reset</button>
            </div>
          </form>
        </ComponentCard>

        {/* TABLE */}
        <div className="md:col-span-2">
          <ComponentCard title="All Marketing Persons">
            <DataTable
              columns={columns}
              data={persons}
              progressPending={loading}
              pagination
              striped
              highlightOnHover
              customStyles={customStyles}
            />
          </ComponentCard>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Delete Marketing Person</h3>
            <p className="mt-2 text-gray-600">
              Are you sure you want to delete <b>{deleteName}</b>?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MarketingPersonList;
