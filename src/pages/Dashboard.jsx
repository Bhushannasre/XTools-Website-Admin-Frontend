import { useEffect, useState } from "react";
import { MdOutlineSubscriptions, MdOutlineDownloading } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { RiContactsLine } from "react-icons/ri";
import { LineGraph } from "../graph/Graph.jsx"; // fixed: was "../graph/graph.jsx" (case mismatch)
import RefreshButton from "../components/RefreshButton.jsx";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const METRIC_CONFIG = [
  {
    key: "totalDownloads",
    title: "Total Downloads",
    icon: <MdOutlineDownloading className="text-3xl text-blue-500" />,
    gradient: "from-blue-100",
  },
  {
    key: "totalSubscriptions",
    title: "Total Subscriptions",
    icon: <MdOutlineSubscriptions className="text-3xl text-green-500" />,
    gradient: "from-green-100",
  },
  {
    key: "totalUsers",
    title: "Total Users",
    icon: <FaRegUserCircle className="text-3xl text-yellow-500" />,
    gradient: "from-yellow-100",
  },
  {
    key: "totalContacts",
    title: "Total Contacts",
    icon: <RiContactsLine className="text-3xl text-red-500" />,
    gradient: "from-red-100",
  },
];

function authHeaders() {
  const token = localStorage.getItem("adminToken");
  return { Authorization: `Bearer ${token}` };
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, graphRes] = await Promise.all([
          fetch(`${BASE_URL}/api/admin/dashboard/stats`, { headers: authHeaders() }),
          fetch(`${BASE_URL}/api/admin/dashboard/graph`, { headers: authHeaders() }),
        ]);

        if (!statsRes.ok) throw new Error("Failed to fetch stats");
        if (!graphRes.ok) throw new Error("Failed to fetch graph data");

        setStats(await statsRes.json());
        setGraphData(await graphRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <div className="admin-card bg-gradient-to-l from-green-700 to-white p-4 sm:p-5 rounded shadow">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome to the admin dashboard! Here you can manage your application and view important metrics.
        </p>
      </div>

      {error && (
        <p className="mt-4 text-red-500 text-sm">Failed to load stats: {error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6">
        {METRIC_CONFIG.map(({ key, title, icon, gradient }) => (
          <div
            key={key}
            className={`p-4 bg-gradient-to-r ${gradient} to-white rounded shadow border border-gray-200 w-full min-w-0 hover:shadow-lg transition-shadow duration-300 flex flex-col gap-2`}
          >
            <h2 className="text-lg font-bold">{title}</h2>
            {icon}
            <h4 className="text-3xl font-bold">
              {loading ? (
                <span className="text-gray-400 text-xl">Loading...</span>
              ) : (
                (stats?.[key] ?? 0).toLocaleString()
              )}
            </h4>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4 sm:mt-6">
         <RefreshButton/>
      </div>
     

      <div className="mt-4 sm:mt-6">
        <LineGraph data={graphData} />
      </div>
    </>
  );
}

export default Dashboard;
