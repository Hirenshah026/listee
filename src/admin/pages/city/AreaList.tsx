import { useEffect, useState } from "react";
import axios from "axios";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Switch from "../../../components/form/switch/Switch";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
import Select from "../../../components/form/Select";

interface City {
  _id: string;
  name: string;
  active: boolean;
}

interface Area {
  _id: string;
  name: string;
  city: City;
  active: boolean;
}

const CITY_API = "http://localhost:5000/api/cities";
const AREA_API = "http://localhost:5000/api/areas";

const customStyles: TableStyles = {
  headRow: { style: { backgroundColor: "#f3f4f6", fontWeight: "600" } },
};

const AreaList = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteAreaName, setDeleteAreaName] = useState<string>("");

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    city: "" as string,
    name: "",
    active: true,
  });

  // ==================== Fetch Data ====================
  const fetchCities = async () => {
    setLoadingCities(true);
    try {
      const { data } = await axios.get(CITY_API);
      if (data.success) setCities(data.cities.filter((c: City) => c.active));
    } catch {
      setMessage({ type: "error", text: "Failed to load cities" });
    }
    setLoadingCities(false);
  };

  const fetchAreas = async () => {
    setLoadingAreas(true);
    try {
      const { data } = await axios.get(AREA_API);
      if (data.success) setAreas(data.areas);
    } catch {
      setMessage({ type: "error", text: "Failed to load areas" });
    }
    setLoadingAreas(false);
  };

  useEffect(() => {
    fetchCities();
    fetchAreas();
  }, []);

  // ==================== Handlers ====================
  const resetForm = () => {
    setEditingId(null);
    setFormData({ city: "", name: "", active: true });
  };

  const handleSelect = (value: any) => {
    setFormData((prev) => ({ ...prev, city: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.city || !formData.name.trim()) return;

    try {
      if (editingId) {
        await axios.put(`${AREA_API}/${editingId}`, {
          cityId: formData.city,
          name: formData.name,
          active: formData.active,
        });
        setMessage({ type: "success", text: "Area updated successfully" });
      } else {
        await axios.post(AREA_API, {
          cityId: formData.city,
          name: formData.name,
          active: formData.active,
        });
        setMessage({ type: "success", text: "Area added successfully" });
      }
      resetForm();
      fetchAreas();
    } catch {
      setMessage({ type: "error", text: "Error saving area" });
    }
  };

  const handleEdit = (area: Area) => {
    setEditingId(area._id);
    setFormData({ city: area.city._id, name: area.name, active: area.active });
  };

  const openDeleteModal = (area: Area) => {
    setDeleteId(area._id);
    setDeleteAreaName(area.name);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await axios.delete(`${AREA_API}/${deleteId}`);
      setMessage({ type: "success", text: `Area "${deleteAreaName}" deleted successfully` });
      fetchAreas();
    } catch (err: any) {
      if (err.response?.data?.message) {
        setMessage({ type: "error", text: err.response.data.message });
      } else {
        setMessage({ type: "error", text: "Failed to delete area" });
      }
    }

    setShowDelete(false);
    setDeleteId(null);
    setDeleteAreaName("");
  };

  const toggleStatus = async (id: string) => {
    try {
      await axios.patch(`${AREA_API}/${id}/toggle`);
      setMessage({ type: "success", text: "Status updated successfully" });
      fetchAreas();
    } catch {
      setMessage({ type: "error", text: "Failed to update status" });
    }
  };

  const cityOptions = cities.map((c) => ({ value: c._id, label: c.name }));

  // ==================== Columns ====================
  const columns: TableColumn<Area>[] = [
    { name: "#", cell: (_, i) => i + 1, width: "60px" },
    { name: "City", selector: (row) => row.city?.name || "-" },
    { name: "Area", selector: (row) => row.name },
    {
      name: "Active",
      cell: (row) => <Switch checked={row.active} onChange={() => toggleStatus(row._id)} />,
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="px-3 py-1 bg-yellow-400 rounded">
            Edit
          </button>
          <button onClick={() => openDeleteModal(row)} className="px-3 py-1 bg-red-600 text-white rounded">
            Delete
          </button>
        </div>
      ),
      center: true,
    },
  ];

  return (
    <>
      <PageMeta title="Area Management" description="Admin Panel" />

      <div className="p-4">
        {message && (
          <div
            className={`mb-4 px-4 py-2 rounded ${
              message.type === "success" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {/* FORM */}
        <ComponentCard title={editingId ? "Edit Area" : "Add Area"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              options={cityOptions}
              placeholder={loadingCities ? "Loading cities..." : "Select City"}
              value={formData.city}
              onChange={handleSelect}
            />

            <input
              placeholder="Area name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full border rounded px-3 py-2"
            />

            {/* Active toggle */}
            <div className="flex items-center gap-2">
              <span>Inactive</span>
              <Switch
                checked={formData.active}
                onChange={(v) => setFormData((prev) => ({ ...prev, active: v }))}
              />
              <span>Active</span>
            </div>

            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded">
                {editingId ? "Update" : "Add"}
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded">
                Reset
              </button>
            </div>
          </form>
        </ComponentCard>

        {/* TABLE */}
        <div className="md:col-span-2">
          <ComponentCard title="All Areas">
            <DataTable
              columns={columns}
              data={areas}
              progressPending={loadingAreas}
              pagination
              highlightOnHover
              striped
              customStyles={customStyles}
              noDataComponent="No area found"
            />
          </ComponentCard>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Delete Area</h3>
            <p className="text-gray-600 mt-2">
              Are you sure you want to delete the area "<span className=" text-2xl">{deleteAreaName}</span>"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AreaList;
