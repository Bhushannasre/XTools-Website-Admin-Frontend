

import { useEffect, useState } from "react";
import RefreshButton from "../components/RefreshButton.jsx";

const BASE_URL = import.meta.env.VITE_API_URL || "";

// NOTE: the real Subscriber schema only tracks isActive (a boolean), not a
// "Read/Recive" status — that field didn't exist anywhere in the database.
// This page now shows Active/Inactive instead, which is what's actually
// stored. If "Read/Receive" was meant to track something else (e.g. whether
// a newsletter email was opened), that needs a new field added to the
// Subscriber schema — let me know and I'll add it.

const columns = [
  { key: "_id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "createdAt", label: "Subscribed" },
  { key: "isActive", label: "Status" },
];

function authHeaders() {
  const token = localStorage.getItem("adminToken");
  return { Authorization: `Bearer ${token}` };
}

function EditModal({ row, onSave, onClose, saving }) {
  const [isActive, setIsActive] = useState(row.isActive);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-800">Edit Status</h2>
        <p className="text-gray-600 text-sm">
          {row.userId?.name || "Unknown"} — {row.email}
        </p>

        <div className="flex flex-col gap-2">
          {[true, false].map((val) => (
            <label
              key={String(val)}
              className={`flex items-center gap-3 px-4 py-3 rounded border cursor-pointer transition
                ${isActive === val ? "border-gray-800 bg-gray-50 font-semibold" : "border-gray-200 hover:bg-gray-50"}`}
            >
              <input
                type="radio"
                name="isActive"
                checked={isActive === val}
                onChange={() => setIsActive(val)}
                className="accent-gray-800"
              />
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  val ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {val ? "Active" : "Inactive"}
              </span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(row._id, isActive)}
            disabled={saving}
            className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Subscribers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(0);
  const [editRow, setEditRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const rowsPerPage = 5;

  const fetchSubscribers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/subscribers`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch subscribers");
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this subscriber?")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/subscribers/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete subscriber");
      setData((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSave = async (id, isActive) => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/subscribers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update subscriber");
      const json = await res.json();
      setData((prev) => prev.map((r) => (r._id === id ? json.data : r)));
      setEditRow(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const counts = {
    All: data.length,
    Active: data.filter((r) => r.isActive).length,
    Inactive: data.filter((r) => !r.isActive).length,
  };

  const filtered = data
    .filter((r) => {
      if (filter === "All") return true;
      if (filter === "Active") return r.isActive;
      return !r.isActive;
    })
    .filter((r) => {
      const name = r.userId?.name || "";
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase())
      );
    });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="flex flex-col gap-6">
      {editRow && (
        <EditModal row={editRow} onSave={handleSave} onClose={() => setEditRow(null)} saving={saving} />
      )}

      <div className="bg-gradient-to-l from-blue-700 to-white p-5 rounded shadow">
        <h1 className="text-3xl font-bold mb-1">Subscriptions</h1>
        <p className="text-gray-600">Manage all user subscriptions.</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2 sm:gap-4 flex-wrap">
        {Object.entries(counts).map(([label, count]) => (
          <div
            key={label}
            onClick={() => {
              setFilter(label);
              setPage(0);
            }}
            className={`cursor-pointer px-4 sm:px-5 py-2.5 sm:py-3 rounded shadow border text-sm font-semibold transition hover:shadow-md
              ${filter === label ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-700 border-gray-200"}`}
          >
            {label} <span className="ml-1 text-lg">{count}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  Loading subscribers...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-8 text-gray-400">
                  No subscribers found.
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={row._id}
                  className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition duration-150`}
                >
                  <td className="py-3 px-4 text-gray-700">{row._id}</td>
                  <td className="py-3 px-4 text-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-bold">
                        {(row.userId?.name || row.email).charAt(0).toUpperCase()}
                      </div>
                      {row.userId?.name || "—"}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{row.email}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        row.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <button
                      onClick={() => setEditRow(row)}
                      className="text-blue-500 hover:text-blue-700 border border-blue-300 rounded px-2 py-1 text-xs font-semibold transition hover:bg-blue-50"
                    >
                      Edit
                    </button>
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
          <div className="bg-white rounded shadow border p-6 text-center text-gray-400">No subscribers found.</div>
        ) : (
          paginated.map((row) => (
            <article key={row._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-hidden">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 shrink-0 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-bold">
                  {(row.userId?.name || row.email || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800 truncate">{row.userId?.name || "—"}</h3>
                  <p className="text-sm text-gray-600 break-all">{row.email || "—"}</p>
                </div>
                <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-semibold ${row.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {row.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-3">Joined {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}</p>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button onClick={() => setEditRow(row)} className="flex-1 text-blue-600 border border-blue-300 rounded px-3 py-2 text-sm font-semibold hover:bg-blue-50 transition">Edit</button>
                <button onClick={() => handleDelete(row._id)} className="flex-1 text-red-600 border border-red-300 rounded px-3 py-2 text-sm font-semibold hover:bg-red-50 transition">Delete</button>
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

export default Subscribers;