


import { useEffect, useState } from "react";
import RefreshButton from "../components/RefreshButton.jsx";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const columns = [
  { key: "_id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "message", label: "Message" },
  { key: "status", label: "Status" },
];

const statusColors = {
  open: "bg-blue-100 text-blue-700",
  closed: "bg-gray-100 text-gray-600",
  pending: "bg-yellow-100 text-yellow-700",
};

const STATUS_OPTIONS = ["open", "pending", "closed"];

/* =========================================================
   AUTH HEADERS
========================================================= */

function authHeaders() {
  const token = localStorage.getItem("adminToken");

  return {
    Authorization: `Bearer ${token}`,
  };
}

/* =========================================================
   EDIT MODAL
========================================================= */

function EditModal({
  row,
  onSave,
  onClose,
  saving,
}) {
  const [form, setForm] = useState({
    name: row?.name || "",
    email: row?.email || "",
    phone: row?.phone || "",
    message: row?.message || "",
    status: row?.status || "open",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl p-5 sm:p-6 w-full max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto">

        <h2 className="text-xl font-bold text-gray-800">
          Edit Contact
        </h2>

        {/* NAME */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">
            Name
          </label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="
              px-3 py-2
              border border-gray-300
              rounded
              focus:outline-none
              focus:ring-2
              focus:ring-blue-400
            "
          />
        </div>

        {/* EMAIL */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="
              px-3 py-2
              border border-gray-300
              rounded
              focus:outline-none
              focus:ring-2
              focus:ring-blue-400
            "
          />
        </div>

        {/* PHONE */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="
              px-3 py-2
              border border-gray-300
              rounded
              focus:outline-none
              focus:ring-2
              focus:ring-blue-400
            "
          />
        </div>

        {/* MESSAGE */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">
            Message
          </label>

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={4}
            className="
              px-3 py-2
              border border-gray-300
              rounded
              resize-none
              focus:outline-none
              focus:ring-2
              focus:ring-blue-400
            "
          />
        </div>

        {/* STATUS */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">
            Status
          </label>

          <div className="flex gap-2">
            {STATUS_OPTIONS.map((status) => (
              <label
                key={status}
                className={`
                  flex items-center gap-2
                  px-3 py-2
                  rounded border
                  cursor-pointer
                  transition
                  flex-1
                  justify-center
                  ${
                    form.status === status
                      ? "border-gray-800 bg-gray-50 font-semibold"
                      : "border-gray-200 hover:bg-gray-50"
                  }
                `}
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={form.status === status}
                  onChange={handleChange}
                  className="accent-gray-800"
                />

                <span
                  className={`
                    px-2 py-0.5
                    rounded-full
                    text-xs
                    font-semibold
                    capitalize
                    ${
                      statusColors[status]
                    }
                  `}
                >
                  {status}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 mt-2">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              px-4 py-2
              rounded
              border border-gray-300
              text-gray-600
              hover:bg-gray-100
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onSave(form)}
            disabled={saving}
            className="
              px-4 py-2
              rounded
              bg-gray-800
              text-white
              hover:bg-gray-700
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {saving ? "Saving..." : "Save"}
          </button>

        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CONTACT PAGE
========================================================= */

function Contact() {
  const [data, setData] = useState([]);

  // Already true initially, so no setLoading(true) in useEffect
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");

  const [sortKey, setSortKey] = useState(null);

  const [sortDir, setSortDir] = useState("asc");

  const [page, setPage] = useState(0);

  const [editRow, setEditRow] = useState(null);

  const [saving, setSaving] = useState(false);

  const rowsPerPage = 5;

  /* =========================================================
     FETCH CONTACTS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadContacts = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/admin/contacts`,
          {
            method: "GET",
            headers: authHeaders(),
          }
        );

        let json = {};

        try {
          json = await res.json();
        } catch {
          json = {};
        }

        if (!res.ok) {
          throw new Error(
            json.error ||
              json.message ||
              `Failed to fetch contacts (${res.status})`
          );
        }

        if (!cancelled) {
          setData(
            Array.isArray(json.data)
              ? json.data
              : []
          );

          setError(null);
          setLoading(false);
        }
      } catch (err) {
        console.error(
          "Fetch contacts error:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "Failed to fetch contacts"
          );

          setLoading(false);
        }
      }
    };

    loadContacts();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     DELETE CONTACT
  ========================================================= */

  const handleDelete = async (id) => {
    if (!id) {
      alert("Invalid contact ID");
      return;
    }

    if (!confirm("Delete this contact?")) {
      return;
    }

    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/contacts/${id}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      let json = {};

      try {
        json = await res.json();
      } catch {
        json = {};
      }

      if (!res.ok) {
        throw new Error(
          json.error ||
            json.message ||
            `Failed to delete contact (${res.status})`
        );
      }

      setData((prev) =>
        prev.filter(
          (row) => row._id !== id
        )
      );
    } catch (err) {
      console.error(
        "Delete contact error:",
        err
      );

      alert(
        err.message ||
          "Failed to delete contact"
      );
    }
  };

  /* =========================================================
     UPDATE CONTACT
  ========================================================= */

  const handleSave = async (updated) => {
    if (!editRow?._id) {
      alert("Invalid contact ID");
      return;
    }

    setSaving(true);

    try {
      /*
       * Only send editable fields.
       * Do not send:
       * _id
       * createdAt
       * updatedAt
       * other MongoDB fields
       */

      const payload = {
        name: updated.name ?? "",
        email: updated.email ?? "",
        phone: updated.phone ?? "",
        message: updated.message ?? "",
        status: updated.status ?? "open",
      };

      console.log(
        "Updating contact:",
        editRow._id
      );

      console.log(
        "Update payload:",
        payload
      );

      const res = await fetch(
        `${BASE_URL}/api/admin/contacts/${editRow._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },

          body: JSON.stringify(payload),
        }
      );

      let json = {};

      try {
        json = await res.json();
      } catch {
        json = {};
      }

      if (!res.ok) {
        console.error(
          "Update contact failed:",
          res.status,
          json
        );

        throw new Error(
          json.error ||
            json.message ||
            `Failed to update contact (${res.status})`
        );
      }

      console.log(
        "Contact updated successfully:",
        json
      );

      setData((prev) =>
        prev.map((row) =>
          row._id === editRow._id
            ? json.data || {
                ...row,
                ...payload,
              }
            : row
        )
      );

      setEditRow(null);
    } catch (err) {
      console.error(
        "Update contact error:",
        err
      );

      alert(
        err.message ||
          "Failed to update contact"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     COUNTS
  ========================================================= */

  const counts = {
    All: data.length,

    open: data.filter(
      (row) => row.status === "open"
    ).length,

    pending: data.filter(
      (row) => row.status === "pending"
    ).length,

    closed: data.filter(
      (row) => row.status === "closed"
    ).length,
  };

  /* =========================================================
     FILTER
  ========================================================= */

  const filtered = data
    .filter(
      (row) =>
        filter === "All" ||
        row.status === filter
    )
    .filter((row) =>
      columns.some((column) =>
        String(
          row[column.key] ?? ""
        )
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      )
    );

  /* =========================================================
     SORT
  ========================================================= */

  const sorted = [...filtered].sort(
    (a, b) => {
      if (!sortKey) {
        return 0;
      }

      const first = String(
        a[sortKey] ?? ""
      );

      const second = String(
        b[sortKey] ?? ""
      );

      return sortDir === "asc"
        ? first.localeCompare(second)
        : second.localeCompare(first);
    }
  );

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.ceil(
    sorted.length / rowsPerPage
  );

  const paginated = sorted.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  /* =========================================================
     SORT HANDLER
  ========================================================= */

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(
        sortDir === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortKey(key);
      setSortDir("asc");
    }

    setPage(0);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex flex-col gap-6">

      {/* EDIT MODAL */}

      {editRow && (
        <EditModal
          row={editRow}
          onSave={handleSave}
          onClose={() =>
            setEditRow(null)
          }
          saving={saving}
        />
      )}

      {/* PAGE HEADER */}

      <div className="bg-gradient-to-l from-red-700 to-white p-5 rounded shadow">
        <h1 className="text-3xl font-bold mb-1">
          Contacts
        </h1>

        <p className="text-gray-600">
          View and manage all incoming contact requests.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* STATUS COUNTS */}

      <div className="flex gap-2 sm:gap-4 flex-wrap">
        {Object.entries(counts).map(
          ([label, count]) => (
            <div
              key={label}
              onClick={() => {
                setFilter(label);
                setPage(0);
              }}
              className={`
                cursor-pointer
                px-4 sm:px-5
                py-2.5 sm:py-3
                rounded
                shadow
                border
                text-sm
                font-semibold
                transition
                hover:shadow-md
                capitalize
                ${
                  filter === label
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-white text-gray-700 border-gray-200"
                }
              `}
            >
              {label}

              <span className="ml-1 text-lg">
                {count}
              </span>
            </div>
          )
        )}
      </div>

      {/* SEARCH + REFRESH */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          gap-3
          w-full
        "
      >
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="
            w-full
            sm:max-w-sm
            px-4
            py-2.5
            border
            border-gray-300
            rounded-lg
            shadow-sm
            focus:outline-none
            focus:ring-2
            focus:ring-blue-400
          "
        />

        <div className="sm:ml-auto">
          <RefreshButton />
        </div>
      </div>

      {/* DESKTOP TABLE */}

      <div className="hidden md:block overflow-x-auto rounded shadow border border-gray-200">
        <table className="min-w-full bg-white text-sm">

          <thead className="bg-gray-800 text-white">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() =>
                    handleSort(
                      column.key
                    )
                  }
                  className="
                    py-3
                    px-4
                    text-left
                    font-semibold
                    cursor-pointer
                    select-none
                    hover:bg-gray-700
                    transition
                  "
                >
                  {column.label}{" "}
                  {sortKey ===
                  column.key
                    ? sortDir === "asc"
                      ? "▲"
                      : "▼"
                    : "⇅"}
                </th>
              ))}

              <th className="py-3 px-4 text-left font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={
                    columns.length + 1
                  }
                  className="text-center py-8 text-gray-400"
                >
                  Loading contacts...
                </td>
              </tr>
            ) : paginated.length ===
              0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length + 1
                  }
                  className="text-center py-8 text-gray-400"
                >
                  No contacts found.
                </td>
              </tr>
            ) : (
              paginated.map(
                (row, index) => (
                  <tr
                    key={row._id}
                    className={`
                      border-t
                      ${
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50"
                      }
                      hover:bg-blue-50
                      transition
                      duration-150
                    `}
                  >
                    {columns.map(
                      (column) => (
                        <td
                          key={
                            column.key
                          }
                          className="py-3 px-4 text-gray-700"
                        >
                          {column.key ===
                          "status" ? (
                            <span
                              className={`
                                px-2
                                py-1
                                rounded-full
                                text-xs
                                font-semibold
                                capitalize
                                ${
                                  statusColors[
                                    row
                                      .status
                                  ] ||
                                  "bg-gray-100 text-gray-600"
                                }
                              `}
                            >
                              {row.status ||
                                "unknown"}
                            </span>
                          ) : (
                            row[
                              column
                                .key
                            ] ??
                            "—"
                          )}
                        </td>
                      )
                    )}

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            setEditRow(
                              row
                            )
                          }
                          className="
                            text-blue-500
                            hover:text-blue-700
                            border
                            border-blue-300
                            rounded
                            px-2
                            py-1
                            text-xs
                            font-semibold
                            transition
                            hover:bg-blue-50
                          "
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              row._id
                            )
                          }
                          className="
                            text-red-500
                            hover:text-red-700
                            border
                            border-red-300
                            rounded
                            px-2
                            py-1
                            text-xs
                            font-semibold
                            transition
                            hover:bg-red-50
                          "
                        >
                          Delete
                        </button>

                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}

      <div className="md:hidden grid gap-3">
        {loading ? (
          <div className="bg-white rounded shadow border p-6 text-center text-gray-400">
            Loading contacts...
          </div>
        ) : paginated.length ===
          0 ? (
          <div className="bg-white rounded shadow border p-6 text-center text-gray-400">
            No contacts found.
          </div>
        ) : (
          paginated.map((row) => (
            <article
              key={row._id}
              className="
                bg-white
                rounded-xl
                shadow-sm
                border
                border-gray-200
                p-4
                overflow-hidden
              "
            >
              <div className="flex items-start justify-between gap-3">

                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {row.name ||
                      "Unknown"}
                  </h3>

                  <p className="text-sm text-blue-600 break-all mt-1">
                    {row.email ||
                      "—"}
                  </p>
                </div>

                <span
                  className={`
                    shrink-0
                    px-2
                    py-1
                    rounded-full
                    text-xs
                    font-semibold
                    capitalize
                    ${
                      statusColors[
                        row.status
                      ] ||
                      "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  {row.status ||
                    "unknown"}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-sm text-gray-600">

                <p>
                  <span className="font-semibold text-gray-800">
                    Phone:
                  </span>{" "}
                  {row.phone || "—"}
                </p>

                <p className="break-words">
                  <span className="font-semibold text-gray-800">
                    Message:
                  </span>{" "}
                  {row.message || "—"}
                </p>

              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-4">

                <button
                  type="button"
                  onClick={() =>
                    setEditRow(row)
                  }
                  className="
                    flex-1
                    text-blue-600
                    border
                    border-blue-300
                    rounded
                    px-3
                    py-2
                    text-sm
                    font-semibold
                    hover:bg-blue-50
                    transition
                  "
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      row._id
                    )
                  }
                  className="
                    flex-1
                    text-red-600
                    border
                    border-red-300
                    rounded
                    px-3
                    py-2
                    text-sm
                    font-semibold
                    hover:bg-red-50
                    transition
                  "
                >
                  Delete
                </button>

              </div>
            </article>
          ))
        )}
      </div>

      {/* PAGINATION */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-3
          text-sm
          text-gray-600
        "
      >
        <span>
          Showing{" "}
          {sorted.length === 0
            ? 0
            : page *
                rowsPerPage +
              1}
          –
          {Math.min(
            (page + 1) *
              rowsPerPage,
            sorted.length
          )}{" "}
          of {sorted.length}
        </span>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() =>
              setPage((p) =>
                Math.max(
                  p - 1,
                  0
                )
              )
            }
            disabled={page === 0}
            className="
              px-3
              py-1
              rounded
              border
              border-gray-300
              hover:bg-gray-100
              disabled:opacity-40
              disabled:cursor-not-allowed
            "
          >
            ← Prev
          </button>

          {Array.from(
            {
              length: totalPages,
            },
            (_, index) => (
              <button
                type="button"
                key={index}
                onClick={() =>
                  setPage(index)
                }
                className={`
                  px-3
                  py-1
                  rounded
                  border
                  ${
                    page === index
                      ? "bg-gray-800 text-white border-gray-800"
                      : "border-gray-300 hover:bg-gray-100"
                  }
                `}
              >
                {index + 1}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() =>
              setPage((p) =>
                Math.min(
                  p + 1,
                  Math.max(
                    totalPages - 1,
                    0
                  )
                )
              )
            }
            disabled={
              totalPages === 0 ||
              page >=
                totalPages - 1
            }
            className="
              px-3
              py-1
              rounded
              border
              border-gray-300
              hover:bg-gray-100
              disabled:opacity-40
              disabled:cursor-not-allowed
            "
          >
            Next →
          </button>

        </div>
      </div>
    </div>
  );
}

export default Contact;