import {
  UserGroupIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

const stats = [
  {
    title: "Total Patients",
    value: "1,248",
    icon: UserGroupIcon,
    color: "bg-blue-500",
  },
  {
    title: "Appointments Today",
    value: "36",
    icon: CalendarDaysIcon,
    color: "bg-green-500",
  },
  {
    title: "Reports Pending",
    value: "12",
    icon: ClipboardDocumentListIcon,
    color: "bg-yellow-500",
  },
  {
    title: "Revenue (Month)",
    value: "₹4,25,000",
    icon: CurrencyRupeeIcon,
    color: "bg-purple-500",
  },
];

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Staff Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Overview of today’s activity & performance
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
          <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
          <span className="text-sm text-gray-700">
            System running smoothly
          </span>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow p-5 flex items-center justify-between hover:shadow-lg transition"
          >
            <div>
              <p className="text-sm text-gray-500">{item.title}</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {item.value}
              </h2>
            </div>

            <div
              className={`p-3 rounded-lg text-white ${item.color}`}
            >
              <item.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT APPOINTMENTS */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Recent Appointments
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Patient</th>
                <th className="pb-2">Doctor</th>
                <th className="pb-2">Time</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {[
                {
                  name: "Rahul Sharma",
                  doctor: "Dr. Mehta",
                  time: "10:30 AM",
                  status: "Completed",
                },
                {
                  name: "Anjali Verma",
                  doctor: "Dr. Singh",
                  time: "12:00 PM",
                  status: "Pending",
                },
                {
                  name: "Mohit Jain",
                  doctor: "Dr. Khan",
                  time: "2:15 PM",
                  status: "Cancelled",
                },
              ].map((item, i) => (
                <tr key={i}>
                  <td className="py-3">{item.name}</td>
                  <td>{item.doctor}</td>
                  <td>{item.time}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium
                        ${
                          item.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }
                      `}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Quick Actions
          </h2>

          <div className="space-y-3">
            {[
              "Add New Patient",
              "Create Appointment",
              "Generate Report",
              "View All Records",
            ].map((action, i) => (
              <button
                key={i}
                className="w-full text-left px-4 py-3 rounded-lg border hover:bg-gray-50 transition text-sm font-medium"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl p-5 shadow">
        <h3 className="text-lg font-semibold">
          Tip for Today
        </h3>
        <p className="text-sm opacity-90 mt-1">
          Keep patient records updated to ensure smooth workflow
        </p>
      </div>
    </div>
  );
}
