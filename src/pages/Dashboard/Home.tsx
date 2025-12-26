import useUser from "../../hooks/useUser";
import { capitalizeWords,  } from "../../utils/string";
interface User {
  name: string;
  email: string;
  phone: string;
  address: string;
  role?: string;
}
export default function Home() {
  const { user, loading } = useUser() as unknown as {
      user: User | null;
      loading: boolean;
      
    };

  return (
    <>
      <div className="p-6">

        {/* Welcome */}
        <h1 className="text-2xl font-semibold mb-6">
          Welcome, {loading ? "..." : capitalizeWords(user?.name || "User") || "User"} 👋
        </h1>

        {/* 4 Boxes */}
        <div className="grid grid-cols-12 gap-4 mb-8">

          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white shadow rounded-xl p-6">
              <p className="text-gray-500 text-sm">Total Roles</p>
              <h2 className="text-3xl font-bold mt-2">5</h2>
            </div>
          </div>

          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white shadow rounded-xl p-6">
              <p className="text-gray-500 text-sm">Total Doctors</p>
              <h2 className="text-3xl font-bold mt-2">120</h2>
            </div>
          </div>

          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white shadow rounded-xl p-6">
              <p className="text-gray-500 text-sm">Total Staff</p>
              <h2 className="text-3xl font-bold mt-2">48</h2>
            </div>
          </div>

          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white shadow rounded-xl p-6">
              <p className="text-gray-500 text-sm">Marketing Person</p>
              <h2 className="text-3xl font-bold mt-2">-</h2>
            </div>
          </div>

        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Lab Requests</h2>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Lab</th>
                  <th className="py-3 px-4">Test Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">1</td>
                  <td className="py-3 px-4">Dr. Rahul</td>
                  <td className="py-3 px-4">City Lab</td>
                  <td className="py-3 px-4">Blood Test</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                      Completed
                    </span>
                  </td>
                  <td className="py-3 px-4">2025-12-02</td>
                </tr>

                <tr className="border-b">
                  <td className="py-3 px-4">2</td>
                  <td className="py-3 px-4">Dr. Anita</td>
                  <td className="py-3 px-4">Metro Lab</td>
                  <td className="py-3 px-4">X-Ray</td>
                  <td className="py-3 px-4">
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">
                      Pending
                    </span>
                  </td>
                  <td className="py-3 px-4">2025-12-03</td>
                </tr>

                <tr>
                  <td className="py-3 px-4">3</td>
                  <td className="py-3 px-4">Dr. Mehta</td>
                  <td className="py-3 px-4">Health Lab</td>
                  <td className="py-3 px-4">MRI Scan</td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                      In Progress
                    </span>
                  </td>
                  <td className="py-3 px-4">2025-12-04</td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
