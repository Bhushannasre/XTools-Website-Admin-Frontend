


import { useEffect, useMemo, useState } from "react";
import RefreshButton from "../components/RefreshButton.jsx";

const BASE_URL = import.meta.env.VITE_API_URL || "";
const ROWS_PER_PAGE = 5;
const STATUS_OPTIONS = ["Active", "Inactive"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// Only JPG/JPEG accepted. To allow more formats later, add their MIME
// types here AND to ALLOWED_IMAGE_TYPES in adminbackend's
// controller/productController.js — both must agree, since the backend
// enforces this independently of whatever the browser sends.
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg"]);
const ALLOWED_IMAGE_LABEL = "JPG or JPEG";

const columns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Product Name" },
  { key: "description", label: "Description" },
  { key: "link", label: "Link" },
  { key: "status", label: "Status" },
];

const statusColors = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-red-100 text-red-700",
};

function authHeaders() {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function fileToImagePayload(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return reject(new Error(`Only ${ALLOWED_IMAGE_LABEL} images are accepted.`));
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return reject(new Error("Image must be smaller than 5 MB."));
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const commaIndex = result.indexOf(",");

      if (commaIndex === -1) {
        return reject(new Error("Could not read the selected image."));
      }

      resolve({
        contentType: file.type,
        data: result.slice(commaIndex + 1),
      });
    };
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

function EditModal({ row, onSave, onClose }) {
  const [form, setForm] = useState({
    id: row.id, // was missing — meant onSave({...form}) never carried the
                // product id, so handleSave's fetch URL became
                // /api/admin/products/undefined and Mongo threw a 500
                // ("Cast to ObjectId failed for value 'undefined'").
    name: row.name || "",
    description: row.description || "",
    link: row.link || "",
    status: row.status || "Active",
    image: null,
  });
  const [preview, setPreview] = useState(row.imageUrl || null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files?.[0];
      if (!file) return;
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        setError(`Only ${ALLOWED_IMAGE_LABEL} images are accepted.`);
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError("Image must be smaller than 5 MB.");
        return;
      }
      setError("");
      setForm((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const image = await fileToImagePayload(form.image);
      await onSave({ ...form, image });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Product Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Product Link *</label>
          <input
            name="link"
            value={form.link}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600">Product Image</label>
          {preview && (
            <img src={preview} alt="Preview" className="w-28 h-20 object-cover rounded border" />
          )}
          <input
            type="file"
            name="image"
            accept="image/jpeg"
            onChange={handleChange}
            className="text-sm"
          />
          <p className="text-xs text-gray-400">Optional. JPG or JPEG only. Maximum size: 5 MB.</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Status</label>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((status) => (
              <label
                key={status}
                className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition flex-1 justify-center ${
                  form.status === status
                    ? "border-gray-800 bg-gray-50 font-semibold"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={form.status === status}
                  onChange={handleChange}
                  className="accent-gray-800"
                />
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[status]}`}>
                  {status}
                </span>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Products() {
  const [data, setData] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    link: "",
    image: null,
    status: "Active",
  });

  // Declared before the effects that call it — react-hooks/immutability
  // flagged the old order (function declared below the useEffect that
  // referenced it) because, even though plain function declarations are
  // runtime-hoisted, the lint rule models source order, not hoisting.
  async function loadProducts() {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/admin/products`, {
        headers: authHeaders(),
      });
      const payload = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) throw new Error(payload.error || "Failed to fetch products");
      setData(payload.data || []);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files?.[0];
      if (!file) return;
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        setFormError(`Only ${ALLOWED_IMAGE_LABEL} images are accepted.`);
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setFormError("Image must be smaller than 5 MB.");
        return;
      }
      setFormError("");
      setForm((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Product name is required.");
      return;
    }

    if (!form.link.trim()) {
      setFormError("Product download link is required.");
      return;
    }

    setSaving(true);
    try {
      const image = await fileToImagePayload(form.image);

      const response = await fetch(`${BASE_URL}/api/admin/products`, {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          link: form.link,
          status: form.status,
          image,
        }),
      });

      const payload = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        window.location.href = "/login";
        return;
      }
      if (!response.ok) throw new Error(payload.error || "Failed to create product");

      setData((prev) => [payload.data, ...prev]);
      setForm({ name: "", description: "", link: "", image: null, status: "Active" });
      setPreview(null);
      setPage(0);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? It will also disappear from the public website.")) return;

    try {
      const response = await fetch(`${BASE_URL}/api/admin/products/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed to delete product");
      setData((prev) => prev.filter((row) => row.id !== id));
    } catch (error) {
      setFormError(error.message);
    }
  };

  const handleSave = async (updated) => {
    // Defensive guard: fall back to the row that was open for editing if
    // the form object somehow doesn't carry an id, instead of silently
    // sending a request to .../products/undefined.
    const productId = updated.id || editRow?.id;
    if (!productId) {
      throw new Error("Could not determine which product to update — please close and reopen the edit dialog.");
    }

    // No try/catch here (ESLint no-useless-catch): there's nothing to add
    // on failure — EditModal's own submit() already catches whatever this
    // throws and shows it in its error state.
    const response = await fetch(`${BASE_URL}/api/admin/products/${productId}`, {
      method: "PUT",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: updated.name,
        description: updated.description,
        link: updated.link,
        status: updated.status,
        image: updated.image,
      }),
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Failed to update product");

    setData((prev) => prev.map((row) => (row.id === updated.id ? payload.data : row)));
    setEditRow(null);
  };

  const counts = useMemo(
    () => ({
      All: data.length,
      Active: data.filter((r) => r.status === "Active").length,
      Inactive: data.filter((r) => r.status === "Inactive").length,
    }),
    [data]
  );

  const filtered = data
    .filter((r) => filter === "All" || r.status === filter)
    .filter((r) =>
      columns.some((col) =>
        String(r[col.key] ?? "").toLowerCase().includes(search.toLowerCase())
      )
    );

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const left = String(a[sortKey] ?? "");
    const right = String(b[sortKey] ?? "");
    return sortDir === "asc" ? left.localeCompare(right) : right.localeCompare(left);
  });

  const totalPages = Math.ceil(sorted.length / ROWS_PER_PAGE);
  const paginated = sorted.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  return (
    <div className="flex flex-col gap-6">
      {editRow && (
        <EditModal
          row={editRow}
          onSave={handleSave}
          onClose={() => setEditRow(null)}
        />
      )}

      <div className="bg-gradient-to-l from-yellow-700 to-white p-5 rounded shadow">
        <h1 className="text-3xl font-bold mb-1">Products</h1>
        <p className="text-gray-600">Manage products shown on the public Xtools website.</p>
      </div>

      <div className="flex gap-2 sm:gap-4 flex-wrap">
        {Object.entries(counts).map(([label, count]) => (
          <div
            key={label}
            onClick={() => {
              setFilter(label);
              setPage(0);
            }}
            className={`cursor-pointer px-4 sm:px-5 py-2.5 sm:py-3 rounded shadow border text-sm font-semibold transition hover:shadow-md ${
              filter === label
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-700 border-gray-200"
            }`}
          >
            {label} <span className="ml-1 text-lg">{count}</span>
          </div>
        ))}
      </div>

      <div className="bg-white p-5 rounded shadow border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Product</h2>
        <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Product Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Enter product name"
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Product Link *</label>
              <input
                name="link"
                value={form.link}
                onChange={handleFormChange}
                placeholder="https://www.mediafire.com/..."
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Enter product description"
              rows={3}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600">Product Image</label>
            {preview && (
              <img src={preview} alt="Preview" className="w-28 h-20 object-cover rounded border" />
            )}
            <input
              type="file"
              name="image"
              accept="image/jpeg"
              onChange={handleFormChange}
              className="text-sm"
            />
            <p className="text-xs text-gray-400">Optional. JPG or JPEG only. Maximum size: 5 MB.</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Status</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((status) => (
                <label
                  key={status}
                  className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition flex-1 justify-center ${
                    form.status === status
                      ? "border-gray-800 bg-gray-50 font-semibold"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={form.status === status}
                    onChange={handleFormChange}
                    className="accent-gray-800"
                  />
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[status]}`}>
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {formError && <p className="text-red-500 text-sm">{formError}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto self-start bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 transition font-semibold disabled:opacity-50"
          >
            {saving ? "Adding..." : "+ Add Product"}
          </button>
        </form>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <RefreshButton />
      </div>

      {loading ? (
        <div className="bg-white rounded shadow border p-8 text-center text-gray-500">Loading products...</div>
      ) : (
        <div className="hidden md:block overflow-x-auto rounded shadow border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="py-3 px-4 text-left font-semibold cursor-pointer select-none hover:bg-gray-700 transition"
                  >
                    {col.label} {sortKey === col.key ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                  </th>
                ))}
                <th className="py-3 px-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-8 text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-yellow-50 transition duration-150`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="py-3 px-4 text-gray-700">
                        {col.key === "id" ? (
                          <span className="font-mono text-xs">{String(row.id).slice(-8)}</span>
                        ) : col.key === "status" ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[row.status]}`}>
                            {row.status}
                          </span>
                        ) : col.key === "link" ? (
                          <a
                            href={row.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:underline truncate max-w-xs block"
                          >
                            {row.link}
                          </a>
                        ) : (
                          row[col.key] || "—"
                        )}
                      </td>
                    ))}

                    <td className="py-3 px-4 flex items-center gap-2">
                      <button
                        onClick={() => setEditRow(row)}
                        className="text-blue-500 hover:text-blue-700 border border-blue-300 rounded px-2 py-1 text-xs font-semibold transition hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
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
      )}

      <div className="md:hidden grid gap-3">
        {paginated.length === 0 ? (
          <div className="bg-white rounded shadow border p-6 text-center text-gray-400">
            No products found.
          </div>
        ) : (
          paginated.map((row) => (
            <article key={row.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{row.name || "Unnamed product"}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-1">ID: {String(row.id).slice(-8)}</p>
                </div>
                <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-semibold ${statusColors[row.status]}`}>
                  {row.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-3 break-words">{row.description || "No description"}</p>
              <a href={row.link} target="_blank" rel="noreferrer" className="block mt-3 text-sm text-blue-600 break-all hover:underline">
                {row.link}
              </a>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button onClick={() => setEditRow(row)} className="flex-1 text-blue-600 border border-blue-300 rounded px-3 py-2 text-sm font-semibold hover:bg-blue-50 transition">Edit</button>
                <button onClick={() => handleDelete(row.id)} className="flex-1 text-red-600 border border-red-300 rounded px-3 py-2 text-sm font-semibold hover:bg-red-50 transition">Delete</button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600">
        <span>
          Showing {sorted.length === 0 ? 0 : page * ROWS_PER_PAGE + 1}–
          {Math.min((page + 1) * ROWS_PER_PAGE, sorted.length)} of {sorted.length}
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
              className={`px-3 py-1 rounded border ${
                page === i ? "bg-gray-800 text-white" : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(p + 1, Math.max(totalPages - 1, 0)))}
            disabled={totalPages === 0 || page >= totalPages - 1}
            className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Products;
              
             