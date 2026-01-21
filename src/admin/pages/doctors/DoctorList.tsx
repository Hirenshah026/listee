import { useEffect, useState } from "react";
import axios from "axios";
import DataTable, { TableColumn } from "react-data-table-component";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import { Link, useNavigate } from "react-router-dom";
import Switch from "../../../components/form/switch/Switch";

const API_URL = "https://listee-backend.onrender.com/api/doctors";
const CITIES_API = "https://listee-backend.onrender.com/api/cities";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp_no: string | null;
  address: string;
  city_name: string | null;
  profile: string | null;
  profile_clinic: string | null;
  role: string;
  active: boolean;
  show: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface City {
  _id: string;
  name: string;
}

const customStyles = {
  rows: { style: { fontSize: "15px", minHeight: "60px" } },
  headCells: { style: { fontSize: "16px", fontWeight: "700", backgroundColor: "#f3f4f6" } },
  cells: { style: { fontSize: "15px" } },
  table: { style: { borderRadius: "10px", overflow: "hidden" } },
  pagination: { style: { fontSize: "15px", padding: "10px" } },
};

const DoctorList = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  // fetch doctors
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL);
      if (data.success) setDoctors(data.doctors);
      setIsError(false);
    } catch {
      setMessage("Failed to load doctors");
      setIsError(true);
    }
    setLoading(false);
  };

  // fetch cities
  const fetchCities = async () => {
    try {
      const { data } = await axios.get(CITIES_API);
      if (data.success) setCities(data.cities);
    } catch (err) {
      console.error("Failed to fetch cities", err);
    }
  };

  useEffect(() => {
    fetchCities();
    fetchDoctors();
  }, []);

  // toggle active
  const toggleStatus = async (id: string, current: boolean) => {
    try {
      const { data } = await axios.patch(`${API_URL}/${id}/active`, { active: !current });
      setMessage(data.message || "Status updated");
      setIsError(false);
      fetchDoctors();
    } catch {
      setMessage("Error updating status");
      setIsError(true);
    }
  };

  // map city id to city name
  const getCityName = (cityId: string | null) => {
    if (!cityId) return "-";
    const city = cities.find((c) => c._id === cityId);
    return city ? city.name : "-";
  };

  // format date + time with AM/PM
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

  const columns: TableColumn<Doctor>[] = [
    {
      name: "#",
      cell: (_row, index) => <div title={`${index! + 1}`}>{index! + 1}</div>,
      width: "70px",
    },
    {
      name: "City",
      selector: (row) => getCityName(row.city_name),
      cell: (row) => <div title={getCityName(row.city_name)}>{getCityName(row.city_name)}</div>,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      cell: (row) => <div title={row.name}>{row.name}</div>,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      cell: (row) => <div title={row.email}>{row.email}</div>,
    },
    {
      name: "Phone",
      selector: (row) => row.phone || "-",
      cell: (row) => <div title={row.phone || "-"}>{row.phone || "-"}</div>,
    },
    {
      name: "WhatsApp",
      selector: (row) => row.whatsapp_no || "-",
      cell: (row) => <div title={row.whatsapp_no || "-"}>{row.whatsapp_no || "-"}</div>,
    },
    {
      name: "Address",
      selector: (row) => row.address || "-",
      cell: (row) => <div title={row.address || "-"}>{row.address || "-"}</div>,
    },
    {
      name: "Active",
      cell: (row) => <Switch checked={row.active} onChange={() => toggleStatus(row._id, row.active)} />,
      center: true,
    },
    {
      name: "Show",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded ${row.show ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"}`}
          title={row.show ? "Shown" : "Hidden"}
        >
          {row.show ? "Shown" : "Hidden"}
        </span>
      ),
      center: true,
    },
    {
      name: "Created At",
      selector: (row) => row.createdAt??"-",
      cell: (row) => <div title={row.createdAt ? formatDateTime(row.createdAt) : "-"}>{row.createdAt ? formatDateTime(row.createdAt) : "-"}</div>,
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <button
          onClick={() => navigate(`/admin/doctors/edit/${row._id}`)}
          className="px-3 py-1 bg-yellow-500 rounded"
        >
          Edit
        </button>
      ),
      center: true,
    },
  ];

  return (
    <>
      <PageMeta title="Doctor Management" description="Admin Panel for doctors" />

      <div className="px-4 py-6">
        <ComponentCard
          title="All Doctors"
          extra={
            <Link to="/admin/doctors/add">
              <button className="text-blue-500 border px-3 py-1 rounded hover:bg-blue-50">
                Add Doctor
              </button>
            </Link>
          }
        >
          {message && (
            <div className={`mb-3 p-2 rounded ${isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {message}
            </div>
          )}

          <DataTable
            columns={columns}
            data={doctors}
            progressPending={loading}
            pagination
            highlightOnHover
            striped
            noDataComponent="No doctors found"
            customStyles={customStyles}
            responsive
          />
        </ComponentCard>
      </div>
    </>
  );
};

export default DoctorList;
