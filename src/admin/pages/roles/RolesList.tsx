import { useEffect, useState } from "react";
import axios from "axios";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import Switch from "../../../components/form/switch/Switch";
import DataTable, { TableColumn } from "react-data-table-component";

const API_URL = "https://listee-backend.onrender.com/api/roles";

interface Role {
  _id: string;
  name: string;
  active: boolean;
  show: boolean;
}

// ⭐ Better UI styles
const customStyles = {
  rows: {
    style: {
      fontSize: "16px",
      minHeight: "55px",
      borderBottom: "1px solid #e5e7eb",
    },
  },
  headCells: {
    style: {
      fontSize: "17px",
      fontWeight: "700",
      backgroundColor: "#f3f4f6",
      paddingTop: "12px",
      paddingBottom: "12px",
    },
  },
  cells: {
    style: {
      fontSize: "16px",
      paddingTop: "10px",
      paddingBottom: "10px",
    },
  },
  table: {
    style: {
      borderRadius: "10px",
      overflow: "hidden",
    },
  },
  pagination: {
    style: {
      fontSize: "16px",
      padding: "10px",
    },
  },
};

const RoleList = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    active: true,
    show: true,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch roles
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL);
      if (data.success) setRoles(data.roles);
      setIsError(false);
    } catch {
      setMessage("Failed to load roles");
      setIsError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      active: true,
      show: true,
    });

    setMessage(null);
    setIsError(false);
  };

  // Input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage("Role name is required");
      setIsError(true);
      return;
    }

    try {
      if (editingId) {
        const { data } = await axios.put(`${API_URL}/${editingId}`, formData);
        setMessage(data.message);
      } else {
        const { data } = await axios.post(API_URL, formData);
        setMessage(data.message);
      }

      setIsError(false);
      fetchRoles();
      setTimeout(resetForm, 2000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error saving role");
      setIsError(true);
    }
  };

  // Edit role
  const handleEdit = (role: Role) => {
    setFormData({
      name: role.name,
      active: role.active,
      show: role.show,
    });
    setEditingId(role._id);
  };

  // Delete role
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure to delete this role?")) return;

    try {
      const { data } = await axios.delete(`${API_URL}/${id}`);
      setMessage(data.message);
      setIsError(false);
      fetchRoles();
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error deleting role");
      setIsError(true);
    }
  };

  // Toggle active
  const toggleStatus = async (id: string, current: boolean) => {
    try {
      const { data } = await axios.patch(`${API_URL}/${id}/active`, {
        active: !current,
      });
      setMessage(data.message);
      setIsError(false);
      fetchRoles();
    } catch {
      setMessage("Error updating status");
      setIsError(true);
    }
  };

  // ⭐ DataTable Columns (Error Free)
  const columns: TableColumn<Role>[] = [
    {
      name: "#",
      cell: (_row, index) => index! + 1,
      width: "80px",
    },
    {
      name: "Role",
      selector: (row) => row.name,
      sortable: true,
    },    
    {
      name: "Active",
      cell: (row) => (
        <Switch checked={row.active} onChange={() => toggleStatus(row._id, row.active)} />
      ),
      center: true,
    },
    {
      name: "Show",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded ${row.show
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-gray-700"
            }`}
        >
          {row.show ? "Shown" : "Hidden"}
        </span>
      ),
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-1 bg-yellow-400 rounded"
          >
            Edit
          </button>

          <button
            onClick={() => handleDelete(row._id)}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            Delete
          </button>
        </div>
      ),
      center: true,
    },
  ];

  return (
    <>
      <PageMeta title="Role Management" description="BLC" />
      <div className="px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Form */}
        <div className="md:col-span-1">
          <ComponentCard title={editingId ? "Edit Role" : "Add Role"}>
            {message && (
              <div
                className={`mb-3 p-2 rounded ${isError
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                  }`}
              >
                {message}
              </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-1 font-medium">Role Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="flex items-center gap-3">
                <label>Hide</label>
                <Switch
                  checked={formData.show}
                  onChange={(v) => setFormData((p) => ({ ...p, show: v }))}
                />
                <label>Show</label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {editingId ? "Update Role" : "Add Role"}
                </button>

                <button
                  type="button"
                  onClick={resetForm} // <-- Reset function
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                >
                  Reset
                </button>
              </div>
            </form>

          </ComponentCard>
        </div>

        {/* Right Table */}
        <div className="md:col-span-2">
          <ComponentCard title="All Roles">
            <DataTable
              columns={columns}
              data={roles}
              progressPending={loading}
              pagination
              highlightOnHover
              striped
              customStyles={customStyles}
              noDataComponent="No roles found"
            />
          </ComponentCard>
        </div>
      </div>
    </>
  );
};

export default RoleList;
