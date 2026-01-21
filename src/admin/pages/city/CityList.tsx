import { useEffect, useState } from "react";
import axios from "axios";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Switch from "../../../components/form/switch/Switch";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";

interface City {
  _id: string;
  name: string;
  state?: string;
  country?: string;
  active: boolean;
  show: boolean;
}

const API_URL = "https://aqua-goat-506711.hostingersite.com/api/cities";

/* =======================
   DataTable Custom Styles
======================= */
const customStyles: TableStyles = {
  headRow: { style: { backgroundColor: "#f3f4f6", fontWeight: "600", fontSize: "14px" } },
  cells: { style: { fontSize: "14px", paddingTop: "8px", paddingBottom: "8px" } },
};

const CityList = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    state: "",
    country: "India",
    show: true,
    active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete modal
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* =======================
     Message Helper
  ======================== */
  const showMessage = (type: "success" | "error", text: string, duration = 3000) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), duration);
  };

  /* =======================
     Fetch Cities
  ======================== */
  const fetchCities = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL);
      if (data.success) setCities(data.cities);
    } catch {
      showMessage("error", "Failed to load cities");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCities();
  }, []);

  /* =======================
     Handlers
  ======================== */
  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", state: "", country: "India", show: true, active: true });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingId) {
        const res = await axios.put(`${API_URL}/${editingId}`, formData);
        res.data.success ? showMessage("success", res.data.message) : showMessage("error", res.data.message || "Update failed");
      } else {
        const res = await axios.post(API_URL, formData);
        res.data.success ? showMessage("success", res.data.message) : showMessage("error", res.data.message || "Create failed");
      }
      fetchCities();
      resetForm();
    } catch (err: any) {
      showMessage("error", err.response?.data?.message || "Server error");
    }
  };

  const handleEdit = (city: City) => {
    setFormData({ name: city.name, state: city.state || "", country: city.country || "India", show: city.show, active: city.active });
    setEditingId(city._id);
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await axios.delete(`${API_URL}/${deleteId}`);
      res.data.success ? showMessage("success", res.data.message) : showMessage("error", res.data.message || "Delete failed");
      setShowDelete(false);
      setDeleteId(null);
      fetchCities();
    } catch (err: any) {
      showMessage("error", err.response?.data?.message || "Server error");
    }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      const res = await axios.patch(`${API_URL}/${id}/toggle`, { active: !current });
      res.data.success ? showMessage("success", res.data.message) : showMessage("error", res.data.message || "Toggle failed");
      fetchCities();
    } catch (err: any) {
      showMessage("error", err.response?.data?.message || "Server error");
    }
  };

  /* =======================
     DataTable Columns
  ======================== */
  const columns: TableColumn<City>[] = [
    { name: "#", cell: (_row, index) => index + 1, width: "60px" },
    { name: "City", selector: (row) => row.name, sortable: true },
    { name: "State", selector: (row) => row.state || "-", sortable: true },
    { name: "Country", selector: (row) => row.country || "-", sortable: true },
    {
      name: "Active",
      cell: (row) => <Switch checked={row.active} onChange={() => toggleStatus(row._id, row.active)} />,
      center: true,
    },
    {
      name: "Show",
      cell: (row) => (
        <span className={`px-2 py-1 rounded text-xs ${row.show ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"}`}>
          {row.show ? "Shown" : "Hidden"}
        </span>
      ),
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="px-2 py-1 bg-yellow-400 rounded">
            Edit
          </button>
          <button onClick={() => openDeleteModal(row._id)} className="px-2 py-1 bg-red-500 text-white rounded">
            Delete
          </button>
        </div>
      ),
      center: true,
    },
  ];

  return (
    <>
      <PageMeta title="City Management" description="Admin Panel" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {/* Inline Message */}
        {message && (
          <div className={`md:col-span-3 mb-4 p-3 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message.text}
          </div>
        )}

        {/* ================= Form ================= */}
        <ComponentCard title={editingId ? "Edit City" : "Add City"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" placeholder="City name" value={formData.name} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            <input name="state" placeholder="State" value={formData.state} onChange={handleChange} className="w-full border rounded px-3 py-2" />

            <div className="flex items-center gap-3">
              <span>Hide</span>
              <Switch checked={formData.show} onChange={(v) => setFormData((p) => ({ ...p, show: v }))} />
              <span>Show</span>
            </div>

            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? "Update" : "Add"}</button>
              <button type="button" onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded">Reset</button>
            </div>
          </form>
        </ComponentCard>

        {/* ================= Table ================= */}
        <div className="md:col-span-2">
          <ComponentCard title="All Cities">
            <DataTable columns={columns} data={cities} progressPending={loading} pagination highlightOnHover striped noDataComponent="No city found" customStyles={customStyles} />
          </ComponentCard>
        </div>
      </div>

      {/* ================= Delete Modal ================= */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Delete City</h3>
            <p className="text-gray-600 mt-2">Are you sure you want to delete this city? This action cannot be undone.</p>
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

export default CityList;
