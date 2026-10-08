import { useEffect, useState } from "react";
import RefreshButton from "../components/RefreshButton.jsx";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const columns = [
  { key: "_id", label: "ID" },
  { key: "username", label: "Username" },
  { key: "email", label: "Email" },
  { key: "createdAt", label: "Joined" },
];

function authHeaders() {
  const token = localStorage.getItem("adminToken");
  return { Authorization: `Bearer ${token}` };
}

function Users() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/users`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch users");
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete user");
      setData((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = data.filter((r) => {
    const username = r.username || "";
    const email = r.email || "";
    return (
      username.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gradient-to-l from-indigo-700 to-white p-5 rounded shadow">
        <h1 className="text-3xl font-bold mb-1">Users</h1>
        <p className="text-gray-600">All registered users on the public Xtools website.</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2 sm:gap-4 flex-wrap">
        <div className="px-4 sm:px-5 py-2.5 sm:py-3 rounded shadow border border-gray-200 bg-white text-sm font-semibold text-gray-700">
          Total <span className="ml-1 text-lg">{data.length}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <RefreshButton />
      </div>

      <div className="hidden md:block overflow-x-auto rounded shadow border border-gray-200">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="py-3 px-4 text-left font-semibold">
                  {col.label}
                </th>
              ))}
              <th className="py-3 px-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-8 text-gray-400">
                  Loading users...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-8 text-gray-400">
                  No users found.
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={row._id}
                  className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50 transition duration-150`}
                >
                  <td className="py-3 px-4 text-gray-700 font-mono text-xs">{row._id}</td>
                  <td className="py-3 px-4 text-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-bold">
                        {(row.username || row.email || "?").charAt(0).toUpperCase()}
                      </div>
                      {row.username || "—"}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{row.email}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDelete(row._id)}
                      className="text-red-500 hover:text-red-700 border border-red-300 rounded px-2 py-1 text-xs font-semibold transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden grid gap-3">
        {paginated.length === 0 ? (
          <div className="bg-white rounded shadow border p-6 text-center text-gray-400">No users found.</div>
        ) : (
          paginated.map((row) => (
            <article key={row._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-hidden">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 shrink-0 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-bold">
                  {(row.username || row.email || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800 truncate">{row.username || "—"}</h3>
                  <p className="text-sm text-gray-600 break-all">{row.email || "—"}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Joined {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button
                  onClick={() => handleDelete(row._id)}
                  className="flex-1 text-red-600 border border-red-300 rounded px-3 py-2 text-sm font-semibold hover:bg-red-50 transition"
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600">
        <span>
          Showing {filtered.length === 0 ? 0 : page * rowsPerPage + 1}–
          {Math.min((page + 1) * rowsPerPage, filtered.length)} of {filtered.length}
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`px-3 py-1 rounded border ${page === i ? "bg-gray-800 text-white" : "border-gray-300 hover:bg-gray-100"}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Users;